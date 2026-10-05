exports.up = async (knex) => {
  await knex('abtests_participants').del();
  await knex('abtests').del();

  await knex.schema.alterTable('abtests', (table) => {
    table.integer('variants_count').notNullable();
  });

  await knex.raw(
    'ALTER TABLE abtests ADD CONSTRAINT abtests_variants_count_check CHECK (variants_count BETWEEN 2 AND 3)',
  );
};

exports.down = async (knex) => {
  await knex.raw('ALTER TABLE abtests DROP CONSTRAINT abtests_variants_count_check');
  await knex.schema.alterTable('abtests', (table) => {
    table.dropColumn('variants_count');
  });
};
