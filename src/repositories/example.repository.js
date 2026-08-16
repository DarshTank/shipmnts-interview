const MemoryStore = require('./memoryStore');

/**
 * DELETE THIS FILE at the start of the task and create one per real resource.
 * It exists to show the shape: services never touch the storage engine
 * directly, only this thin repository.
 */
const store = new MemoryStore('examples');

module.exports = {
  create: (data) => store.create(data),
  findById: (id) => store.findById(id),
  findAll: (opts) => store.findAll(opts),
  update: (id, changes, expectedVersion) => store.update(id, changes, expectedVersion),
  remove: (id) => store.delete(id),
  clear: () => store.clear(),
};
