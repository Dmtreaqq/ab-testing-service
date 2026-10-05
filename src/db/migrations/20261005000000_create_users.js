exports.up = (knex) =>
  knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('email').notNullable().unique();
    table.text('name').notNullable();
    table.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTable('users');
