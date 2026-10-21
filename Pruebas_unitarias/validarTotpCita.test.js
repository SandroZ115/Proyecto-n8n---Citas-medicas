const test = require('node:test');
const assert = require('node:assert');
const { generarTOTP, validarTotpCita } = require('./validarTotpCita');

const secretPrueba = 'JBSWY3DPEHPK3PXP'; // Secreto base32 estándar
const tiempoFijoStep = 57000000; // Paso de tiempo simulado y fijo

test('Validar TOTP Cita: Usuario bloqueado debe retornar resultado "bloqueado"', () => {
  const sesion = { esta_bloqueado: true, totp_secret: secretPrueba };
  const resultado = validarTotpCita(sesion, '123456', tiempoFijoStep);

  assert.strictEqual(resultado.resultado, 'bloqueado');
});

test('Validar TOTP Cita: Código TOTP correcto debe retornar resultado "valido"', () => {
  const codigoValido = generarTOTP(secretPrueba, tiempoFijoStep);
  const sesion = { esta_bloqueado: false, totp_secret: secretPrueba };
  
  const resultado = validarTotpCita(sesion, codigoValido, tiempoFijoStep);

  assert.strictEqual(resultado.resultado, 'valido');
});

test('Validar TOTP Cita: Código TOTP incorrecto debe retornar resultado "invalido"', () => {
  const sesion = { esta_bloqueado: false, totp_secret: secretPrueba };
  
  const resultado = validarTotpCita(sesion, '000000', tiempoFijoStep);

  assert.strictEqual(resultado.resultado, 'invalido');
});