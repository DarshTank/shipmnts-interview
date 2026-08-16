const request = require('supertest');
const app = require('../src/app');
const repo = require('../src/repositories/example.repository');

const BASE = '/api/v1/examples';

beforeEach(async () => {
  await repo.clear();
});

describe('examples CRUD', () => {
  it('creates a record and returns 201 with a Location header', async () => {
    const res = await request(app).post(BASE).send({ name: 'First' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('First');
    expect(res.body.data.status).toBe('draft');
    expect(res.headers.location).toContain(res.body.data.id);
  });

  it('rejects an invalid body with 400 and a field-level error list', async () => {
    const res = await request(app).post(BASE).send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('name');
  });

  it('returns 404 for a missing record', async () => {
    const res = await request(app).get(`${BASE}/3d0f0b5e-0000-4000-8000-000000000000`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for a malformed id', async () => {
    const res = await request(app).get(`${BASE}/not-a-uuid`);
    expect(res.status).toBe(400);
  });

  it('paginates the list endpoint', async () => {
    for (let i = 0; i < 15; i++) {
      await request(app).post(BASE).send({ name: `Item ${i}` });
    }
    const res = await request(app).get(`${BASE}?page=2&limit=10`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.meta.total).toBe(15);
    expect(res.body.meta.hasNext).toBe(false);
  });

  it('replays the same response for a repeated Idempotency-Key', async () => {
    const key = 'test-key-123';
    const first = await request(app).post(BASE).set('Idempotency-Key', key).send({ name: 'Once' });
    const second = await request(app).post(BASE).set('Idempotency-Key', key).send({ name: 'Once' });
    expect(second.status).toBe(201);
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(second.headers['x-idempotent-replay']).toBe('true');
  });

  it('rejects a stale update with 409 (optimistic locking)', async () => {
    const created = await request(app).post(BASE).send({ name: 'Locked' });
    const { id } = created.body.data;
    await request(app).patch(`${BASE}/${id}`).set('If-Match', '1').send({ name: 'v2' });
    const stale = await request(app).patch(`${BASE}/${id}`).set('If-Match', '1').send({ name: 'v3' });
    expect(stale.status).toBe(409);
  });

  it('deletes and then 404s', async () => {
    const created = await request(app).post(BASE).send({ name: 'Temp' });
    const { id } = created.body.data;
    const del = await request(app).delete(`${BASE}/${id}`);
    expect(del.status).toBe(204);
    const after = await request(app).get(`${BASE}/${id}`);
    expect(after.status).toBe(404);
  });
});
