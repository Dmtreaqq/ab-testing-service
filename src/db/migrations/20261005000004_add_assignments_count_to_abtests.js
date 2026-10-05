exports.up = async (knex) => {
  await knex.schema.alterTable('abtests', (table) => {
    table.integer('assignments_count').notNullable().defaultTo(0);
  });

  await knex.raw(`
    UPDATE abtests a
    SET assignments_count = (SELECT count(*) FROM abtests_participants p WHERE p.abtest_id = a.id)
  `);
};

exports.down = (knex) =>
  knex.schema.alterTable('abtests', (table) => {
    table.dropColumn('assignments_count');
  });
