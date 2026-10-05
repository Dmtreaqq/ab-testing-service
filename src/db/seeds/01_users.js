exports.seed = async (knex) => {
  await knex('users').del();
  await knex('users').insert([
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' },
  ]);
};
