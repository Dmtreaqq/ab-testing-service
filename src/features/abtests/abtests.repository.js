const db = require('../../db/knex');

const TABLE = 'abtests';
const PARTICIPANTS_TABLE = 'abtests_participants';

function toAbtest(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    active: row.active,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    variantsCount: row.variants_count,
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

async function create({ name, active, dateStart, dateEnd, variantsCount }) {
  const [row] = await db(TABLE)
    .insert({
      name,
      active,
      date_start: dateStart,
      date_end: dateEnd,
      variants_count: variantsCount,
    })
    .returning('*');
  return toAbtest(row);
}

async function update(id, { name, active, dateStart, dateEnd, variantsCount }) {
  const [row] = await db(TABLE)
    .where({ id })
    .update({
      name,
      active,
      date_start: dateStart,
      date_end: dateEnd,
      variants_count: variantsCount,
      updated_at: db.fn.now(),
    })
    .returning('*');
  return toAbtest(row);
}

async function activate(id) {
  const [row] = await db(TABLE)
    .where({ id, active: false })
    .where('date_end', '>', db.fn.now())
    .update({ active: true, updated_at: db.fn.now() })
    .returning('*');
  return toAbtest(row);
}

async function deactivate(id) {
  const [row] = await db(TABLE)
    .where({ id, active: true })
    .update({ active: false, updated_at: db.fn.now() })
    .returning('*');
  return toAbtest(row);
}

async function findNotEnded() {
  const rows = await db(TABLE).where('date_end', '>', db.fn.now()).orderBy('date_start', 'asc');
  return rows.map(toAbtest);
}

async function deactivateEnded() {
  const rows = await db(TABLE)
    .where({ active: true })
    .where('date_end', '<=', db.fn.now())
    .update({ active: false, updated_at: db.fn.now() })
    .returning('*');
  return rows.map(toAbtest);
}

async function remove(id) {
  const count = await db(TABLE).where({ id }).del();
  return count > 0;
}

async function findVariant(abTestId, userId, trx = db) {
  const row = await trx(PARTICIPANTS_TABLE)
    .select('variant')
    .where({ abtest_id: abTestId, user_id: userId })
    .first();
  return row ? row.variant : null;
}

async function assignVariant(abTestId, userId, variantsCount) {
  return db.transaction(async (trx) => {
    await trx.raw('SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))', [abTestId, userId]);

    const existing = await findVariant(abTestId, userId, trx);
    if (existing !== null) return existing;

    const [{ assignments_count: seq }] = await trx(TABLE)
      .where({ id: abTestId })
      .increment('assignments_count', 1)
      .returning('assignments_count');
    const variant = ((seq - 1) % variantsCount) + 1;

    await trx(PARTICIPANTS_TABLE).insert({ abtest_id: abTestId, user_id: userId, variant });
    return variant;
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  activate,
  deactivate,
  findNotEnded,
  deactivateEnded,
  remove,
  findVariant,
  assignVariant,
};
