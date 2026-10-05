exports.up = async (knex) => {
  await knex.schema.createTable('abtests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable();
    table.boolean('active').notNullable().defaultTo(false);
    table.timestamp('date_start', { useTz: true }).notNullable();
    table.timestamp('date_end', { useTz: true }).notNullable();
    table.timestamps(true, true);
  });

  await knex.raw(
    'ALTER TABLE abtests ADD CONSTRAINT abtests_date_range_check CHECK (date_end > date_start)',
  );
};

exports.down = (knex) => knex.schema.dropTable('abtests');
