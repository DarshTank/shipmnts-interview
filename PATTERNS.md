# Patterns cheat-sheet

Reference notes to read from and adapt — not pre-written domain code. Keep this
open in a second tab. Each block is ~2 minutes to type.

---

## 1. State machine (status transitions)

The single most likely "business rule" in a logistics-flavoured task.

```js
// services/<resource>.service.js
const TRANSITIONS = {
  draft:     ['booked', 'cancelled'],
  booked:    ['in_transit', 'cancelled'],
  in_transit:['delivered', 'exception'],
  exception: ['in_transit', 'cancelled'],
  delivered: [],
  cancelled: [],
};

function assertTransition(from, to) {
  const allowed = TRANSITIONS[from];
  if (!allowed) throw ApiError.unprocessable(`Unknown status: ${from}`);
  if (!allowed.includes(to)) {
    throw ApiError.conflict(
      `Cannot move from ${from} to ${to}. Allowed: ${allowed.join(', ') || 'none'}`
    );
  }
}

async function changeStatus(id, nextStatus, note) {
  const record = await getById(id);
  assertTransition(record.status, nextStatus);
  return repo.update(id, {
    status: nextStatus,
    events: [...(record.events || []), {
      from: record.status, to: nextStatus, note, at: new Date().toISOString(),
    }],
  });
}
```

Say out loud: *"I'm encoding the transitions in a table rather than if-else so
adding a status is a one-line change, and so the error message can tell the
client what IS allowed."*

---

## 2. Overlap / double-booking detection

For "don't allocate the same slot twice" style rules.

```js
// two ranges overlap iff aStart < bEnd && bStart < aEnd
const overlaps = (aStart, aEnd, bStart, bEnd) =>
  new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);

async function book({ resourceId, startAt, endAt }) {
  if (new Date(startAt) >= new Date(endAt)) {
    throw ApiError.badRequest('startAt must be before endAt');
  }
  const { items } = await repo.findAll({
    filter: (b) => b.resourceId === resourceId && b.status !== 'cancelled',
    limit: Number.MAX_SAFE_INTEGER,
  });
  const clash = items.find((b) => overlaps(startAt, endAt, b.startAt, b.endAt));
  if (clash) throw ApiError.conflict(`Conflicts with booking ${clash.id}`);
  return repo.create({ resourceId, startAt, endAt, status: 'confirmed' });
}
```

Mention: *"In a real DB this is an exclusion constraint or a `SELECT … FOR
UPDATE` inside a transaction — the read-then-write here is racy without it."*

---

## 3. Capacity / counter guard

```js
async function allocate(slotId, qty) {
  const slot = await slotRepo.findById(slotId);
  if (!slot) throw ApiError.notFound('Slot not found');
  const used = await allocationRepo.sum(slotId);          // or slot.used
  if (used + qty > slot.capacity) {
    throw ApiError.unprocessable(
      `Only ${slot.capacity - used} units available, requested ${qty}`
    );
  }
  return allocationRepo.create({ slotId, qty });
}
```

---

## 4. JWT auth (if they ask for it)

```js
// npm i jsonwebtoken bcryptjs
const jwt = require('jsonwebtoken');

const sign = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

// middlewares/auth.js
function auth(req, res, next) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(ApiError.unauthorized('Missing bearer token'));
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (e) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

// role guard
const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : next(ApiError.forbidden());

// usage: router.post('/', auth, requireRole('admin'), controller.create)
```

Talking point: short-lived access token + long-lived refresh token stored in an
httpOnly cookie; 401 = "who are you", 403 = "I know who you are, you can't".

---

## 5. Soft delete + audit trail

Two of the most common "now add this" asks.

```js
// soft delete
async function remove(id, actorId) {
  await getById(id);
  return repo.update(id, { deletedAt: new Date().toISOString(), deletedBy: actorId });
}
// every read path then filters: (r) => !r.deletedAt

// audit trail
async function update(id, changes, actorId) {
  const before = await getById(id);
  const after = await repo.update(id, changes);
  const diff = Object.keys(changes)
    .filter((k) => before[k] !== after[k])
    .map((k) => ({ field: k, from: before[k], to: after[k] }));
  await auditRepo.create({ entity: 'shipment', entityId: id, actorId, diff,
    at: new Date().toISOString() });
  return after;
}
```

---

## 6. Webhook / event on change

```js
const { EventEmitter } = require('events');
const bus = new EventEmitter();

bus.on('shipment.status_changed', async (payload) => {
  // fire-and-forget; never block the request on an outbound call
  for (const url of await subscriptionRepo.urlsFor(payload.shipmentId)) {
    fetch(url, { method: 'POST', body: JSON.stringify(payload) })
      .catch((e) => logger.error('Webhook failed', { url, error: e.message }));
  }
});

// in the service, after a successful status change:
bus.emit('shipment.status_changed', { shipmentId: id, status: nextStatus });
```

Say: *"In production this is a queue with retries and a dead-letter, not an
in-process emitter — a webhook that fails here is silently lost."*

---

## 7. Cursor pagination (if they push on offset pagination)

```js
// GET /shipments?cursor=<lastId>&limit=20
// offset gets slower as the table grows and skips/duplicates rows when
// records are inserted between page loads. Cursor is stable and O(limit).
const rows = await db.query(
  `SELECT * FROM shipments WHERE created_at < $1 ORDER BY created_at DESC LIMIT $2`,
  [cursorTimestamp, limit + 1]
);
const hasNext = rows.length > limit;
const items = hasNext ? rows.slice(0, limit) : rows;
const nextCursor = hasNext ? items[items.length - 1].created_at : null;
```

---

## 8. Long-running work → 202 Accepted

```js
// POST /reports  ->  202 { jobId }
// GET  /reports/:jobId  ->  200 { status: 'pending' | 'done', result }
const job = await jobRepo.create({ status: 'pending', type: 'customs_doc' });
setImmediate(() => runJob(job.id));       // real answer: BullMQ + Redis worker
return res.status(202).json({ success: true, data: { jobId: job.id } });
```

---

## 9. Search / filter without query injection

```js
const ALLOWED_FILTERS = ['status', 'origin', 'destination', 'customerId'];

function buildFilter(query) {
  const active = Object.entries(query)
    .filter(([k]) => ALLOWED_FILTERS.includes(k));
  return (row) => active.every(([k, v]) => String(row[k]) === String(v));
}
```

---

## 10. Status-code decision table

| Situation | Code |
|---|---|
| Created a resource | 201 + `Location` header |
| Updated / fetched | 200 |
| Deleted, nothing to return | 204 |
| Accepted, work continues async | 202 |
| Bad shape / missing field / bad type | 400 |
| Not logged in / bad token | 401 |
| Logged in, not allowed | 403 |
| Resource doesn't exist | 404 |
| Method not allowed on this path | 405 |
| Duplicate, stale version, illegal state transition | 409 |
| Well-formed but breaks a business rule | 422 |
| Rate limited | 429 |
| Unhandled | 500 |

---

## 11. Things to say out loud

- "Let me restate the requirements before I code, so we agree on scope."
- "I'll build the happy path first, then harden validation — tell me if you'd
  rather see it the other way."
- "This read-then-write is racy; in Postgres I'd wrap it in a transaction with
  `SELECT … FOR UPDATE`."
- "I'm returning 409 rather than 400 because the request is valid — the
  resource state is what rejects it."
- "I've deprioritised X to get Y correct — happy to add X if you'd rather see
  breadth."
