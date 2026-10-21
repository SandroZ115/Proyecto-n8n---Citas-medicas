const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const { validarPassword } = require('./password');

// Generamos un salt y un hash simulados para las pruebas
const saltPrueba = 'abc123salt';
const passwordReal = 'MiPasswordSeguro123';
const hashReal = crypto.createHash('sha256').update(passwordReal + saltPrueba).digest('hex');

test('Validación Password: Caso exitoso (password correcto)', () => {
  const item = { usuario: 'Sandro', salt: saltPrueba, password_hash: hashReal };
  const resultado = validarPassword(item, passwordReal);

  assert.strictEqual(resultado.password_valida, true);
});

test('Validación Password: Caso fallido (password incorrecto)', () => {
  const item = { usuario: 'Sandro', salt: saltPrueba, password_hash: hashReal };
  const resultado = validarPassword(item, 'PasswordEquivocado');

  assert.strictEqual(resultado.password_valida, false);
});