const usersRepository = require('./users.repository');
const { NotFoundError, ConflictError } = require('../../lib/errors');

async function list() {
  return usersRepository.findAll();
}

async function getById(id) {
  const user = await usersRepository.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

async function create(data) {
  const existing = await usersRepository.findByEmail(data.email);
  if (existing) throw new ConflictError('Email already in use');
  return usersRepository.create(data);
}

async function replace(id, data) {
  await getById(id);

  const existing = await usersRepository.findByEmail(data.email);
  if (existing && existing.id !== id) throw new ConflictError('Email already in use');

  return usersRepository.update(id, data);
}

async function remove(id) {
  const deleted = await usersRepository.remove(id);
  if (!deleted) throw new NotFoundError('User not found');
}

module.exports = { list, getById, create, replace, remove };
