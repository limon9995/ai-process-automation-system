import { db } from '../db/database.js';

export const userService = {
  listOperators() {
    return db.prepare(`
      SELECT * FROM users
      WHERE role IN ('account-manager', 'support-operator', 'community-manager', 'driver')
      ORDER BY id ASC
    `).all();
  },

  createMany(users) {
    const insert = db.prepare('INSERT INTO users (name, role, is_available) VALUES (?, ?, ?)');
    const transaction = db.transaction((items) => {
      for (const user of items) {
        insert.run(user.name, user.role, user.isAvailable ? 1 : 0);
      }
    });

    transaction(users);
    return this.listOperators();
  },

  count() {
    return db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  },

  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
};
