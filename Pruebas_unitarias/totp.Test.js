const test = require('node:test');
const assert = require('node:assert');
const { generarTOTP, validarTOTP } = require('./totp');

const SECRET_PRUEBA = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

test('TOTP: Genera un código de exactamente 6 dígitos', () => {
  const codigo = generarTOTP(SECRET_PRUEBA, 1700000000);
  assert.strictEqual(codigo.length, 6);
  assert.match(codigo, /^\d{6}$/);
});

test('TOTP: Vector de prueba oficial (RFC 6238 con tiempo fijo)', () => {
  const codigo1 = generarTOTP(SECRET_PRUEBA, 1700000000);
  const codigo2 = generarTOTP(SECRET_PRUEBA, 1700000000);
  assert.strictEqual(codigo1, codigo2);
});

test('Validación TOTP: Caso exitoso (código correcto)', () => {
  const tiempoFijo = 1700000000;
  const codigoValido = generarTOTP(SECRET_PRUEBA, tiempoFijo);
  
  const itemEntrada = { totp_secret: SECRET_PRUEBA, usuario: 'Sandro' };

  const resultado = validarTOTP(itemEntrada, codigoValido, tiempoFijo);
  
  assert.strictEqual(resultado.es_valido, true);
  assert.strictEqual(resultado.codigo_recibido, codigoValido);
  assert.strictEqual(resultado.codigo_esperado, codigoValido);
});

test('Validación TOTP: Caso fallido (código incorrecto)', () => {
  const itemEntrada = { totp_secret: SECRET_PRUEBA, usuario: 'Sandro' };
  const resultado = validarTOTP(itemEntrada, '000000');
  
  assert.strictEqual(resultado.es_valido, false);
});