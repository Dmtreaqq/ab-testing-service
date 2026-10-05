const db = require('../../db/knex');

const TABLE = 'abtests';

function toAbtest(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    active: row.active,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findAll() {
  const rows = await db(TABLE).select('*').orderBy('created_at', 'asc');
  return rows.map(toAbtest);
}

async function findById(id) {
  const row = await db(TABLE).where({ id }).first();
  return toAbtest(row);
}

async function create({ name, active, dateStart, dateEnd }) {
  const [row] = await db(TABLE)
    .insert({ name, active, date_start: dateStart, date_end: dateEnd })
    .returning('*');
  return toAbtest(row);
}

async function update(id, { name, active, dateStart, dateEnd }) {
  const [row] = await db(TABLE)
    .where({ id })
    .update({
      name,
      active,
      date_start: dateStart,
      date_end: dateEnd,
      updated_at: db.fn.now(),
    })
    .returning('*');
  return toAbtest(row);
}

async function remove(id) {
  const count = await db(TABLE).where({ id }).del();
  return count > 0;
}

module.exports = { findAll, findById, create, update, remove };
