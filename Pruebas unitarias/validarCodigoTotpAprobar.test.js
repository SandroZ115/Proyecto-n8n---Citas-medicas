const test = require('node:test');
const assert = require('node:assert');
const { generarTOTP, validarCodigoTotpAprobar } = require('./validarCodigoTotpAprobar');

const secretPrueba = 'JBSWY3DPEHPK3PXP'; // Secreto base32 estándar de prueba
const tiempoFijoStep = 57000000; // Paso de tiempo simulado y fijo

test('Validar Código TOTP Aprobar: Código correcto debe retornar es_valido: true', () => {
  // Generamos el código esperado usando el mismo paso de tiempo simulado
  const codigoValido = generarTOTP(secretPrueba, tiempoFijoStep);
  const item = { usuario_id: 3, totp_secret: secretPrueba, cita_id: 10 };
  
  const resultado = validarCodigoTotpAprobar(item, codigoValido, tiempoFijoStep);

  assert.strictEqual(resultado.es_valido, true);
  assert.strictEqual(resultado.codigo_recibido, codigoValido);
  assert.strictEqual(resultado.codigo_esperado, codigoValido);
});

test('Validar Código TOTP Aprobar: Código incorrecto debe retornar es_valido: false', () => {
  const item = { usuario_id: 3, totp_secret: secretPrueba, cita_id: 10 };
  const codigoErroneo = '000000';
  
  const resultado = validarCodigoTotpAprobar(item, codigoErroneo, tiempoFijoStep);

  assert.strictEqual(resultado.es_valido, false);
  assert.strictEqual(resultado.codigo_recibido, codigoErroneo);
  assert.notStrictEqual(resultado.codigo_esperado, codigoErroneo);
});