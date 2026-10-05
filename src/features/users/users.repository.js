const db = require('../../db/knex');

const TABLE = 'users';

function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findAll() {
  const rows = await db(TABLE).select('*').orderBy('created_at', 'asc');
  return rows.map(toUser);
}

async function findById(id) {
  const row = await db(TABLE).where({ id }).first();
  return toUser(row);
}

async function findByEmail(email) {
  const row = await db(TABLE).where({ email }).first();
  return toUser(row);
}

async function create({ email, name }) {
  const [row] = await db(TABLE).insert({ email, name }).returning('*');
  return toUser(row);
}

async function update(id, { email, name }) {
  const [row] = await db(TABLE)
    .where({ id })
    .update({ email, name, updated_at: db.fn.now() })
    .returning('*');
  return toUser(row);
}

async function remove(id) {
  const count = await db(TABLE).where({ id }).del();
  return count > 0;
}

module.exports = { findAll, findById, findByEmail, create, update, remove };
