exports.up = (knex) =>
  knex.schema.createTable('abtests_participants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.uuid('abtest_id').notNullable();
    table.integer('variant').notNullable();
    table.timestamps(true, true);
    table.unique(['user_id', 'abtest_id']);
  });

exports.down = (knex) => knex.schema.dropTable('abtests_participants');
