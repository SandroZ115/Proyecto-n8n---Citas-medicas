const test = require('node:test');
const assert = require('node:assert');
const { generarToken } = require('./generarToken');

const tiempoFijo = '2026-06-01T12:00:00.000Z';

test('Generar Token: Debe retornar un token hexadecimal de 64 caracteres', () => {
  const item = { usuario: 'Sandro', es_valido_totp: true };
  const resultado = generarToken(item, tiempoFijo);

  // 32 bytes en formato hexadecimal producen exactamente 64 caracteres
  assert.strictEqual(typeof resultado.token, 'string');
  assert.strictEqual(resultado.token.length, 64);
});

test('Generar Token: Debe calcular la expiración exactamente 8 horas después', () => {
  const item = { usuario: 'Sandro', es_valido_totp: true };
  const resultado = generarToken(item, tiempoFijo);

  // 12:00:00 + 8 horas = 20:00:00 del mismo día
  const esperadoExpiracion = '2026-06-01T20:00:00.000Z';
  assert.strictEqual(resultado.expira_en, esperadoExpiracion);
  assert.strictEqual(resultado.usuario, 'Sandro');
});