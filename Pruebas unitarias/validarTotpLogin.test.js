const test = require('node:test');
const assert = require('node:assert');
const { generarTOTP, validarTotpLogin } = require('./validarTOTPlogin');

const secretPrueba = 'JBSWY3DPEHPK3PXP'; // Secreto base32 estándar de prueba
const tiempoFijoStep = 57000000; // Paso de tiempo simulado y fijo

test('Validar TOTP Login: Código correcto debe retornar es_valido_totp: true', () => {
  // Generá dinámicamente el código correcto usando el mismo tiempo fijo
  const codigoValido = generarTOTP(secretPrueba, tiempoFijoStep);
  const item = { usuario: 'Sandro', totp_secret: secretPrueba };
  
  const resultado = validarTotpLogin(item, codigoValido, tiempoFijoStep);

  assert.strictEqual(resultado.es_valido_totp, true);
  assert.strictEqual(resultado.codigo_recibido, codigoValido);
});

test('Validar TOTP Login: Código incorrecto debe retornar es_valido_totp: false', () => {
  const item = { usuario: 'Sandro', totp_secret: secretPrueba };
  
  // Pasá un código erróneo a propósito
  const resultado = validarTotpLogin(item, '000000', tiempoFijoStep);

  assert.strictEqual(resultado.es_valido_totp, false);
  assert.strictEqual(resultado.codigo_recibido, '000000');
});