const { randomUUID } = require('crypto');

/**
 * Generic in-memory collection with the same surface a real repository has:
 * create / findById / findAll / update / delete.
 *
 * Why this exists: it lets you build correct layering in minute one and swap
 * in Mongo/Postgres later by rewriting ONE file. It also means a broken DB
 * install can never cost you the round.
 *
 * Includes optimistic locking via `version` - the answer to
 * "what if two users update the same record at once?"
 */
class MemoryStore {
  constructor(name = 'collection') {
    this.name = name;
    this.items = new Map();
  }

  async create(data) {
    const now = new Date().toISOString();
    const record = {
      id: data.id || randomUUID(),
      ...data,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(record.id, record);
    return { ...record };
  }

  async findById(id) {
    const found = this.items.get(id);
    return found ? { ...found } : null;
  }

  async findOne(predicate) {
    for (const item of this.items.values()) {
      if (predicate(item)) return { ...item };
    }
    return null;
  }

  /**
   * @param {object} opts
   * @param {function} [opts.filter]  predicate applied to each record
   * @param {string}   [opts.sortBy]
   * @param {number}   [opts.direction] 1 asc, -1 desc
   * @param {number}   [opts.skip]
   * @param {number}   [opts.limit]
   */
  async findAll({ filter, sortBy = 'createdAt', direction = -1, skip = 0, limit = 10 } = {}) {
    let rows = [...this.items.values()];
    if (filter) rows = rows.filter(filter);

    rows.sort((a, b) => {
      const x = a[sortBy];
      const y = b[sortBy];
      if (x === y) return 0;
      return (x > y ? 1 : -1) * direction;
    });

    const total = rows.length;
    const page = rows.slice(skip, skip + limit).map((r) => ({ ...r }));
    return { items: page, total };
  }

  async count(filter) {
    if (!filter) return this.items.size;
    return [...this.items.values()].filter(filter).length;
  }

  /**
   * @param {string} id
   * @param {object} changes
   * @param {number} [expectedVersion] pass to enable optimistic locking;
   *                 returns null-safe conflict signal via thrown VersionConflict
   */
  async update(id, changes, expectedVersion) {
    const existing = this.items.get(id);
    if (!existing) return null;

    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      const err = new Error('Version conflict');
      err.code = 'VERSION_CONFLICT';
      throw err;
    }

    const updated = {
      ...existing,
      ...changes,
      id: existing.id,
      version: existing.version + 1,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(id, updated);
    return { ...updated };
  }

  async delete(id) {
    return this.items.delete(id);
  }

  async clear() {
    this.items.clear();
  }
}

module.exports = MemoryStore;
