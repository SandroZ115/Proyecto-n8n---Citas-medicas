const test = require('node:test');
const assert = require('node:assert');
const { generarSecretoBase32, hashPassword, generarCodigosRespaldo, procesarRegistro } = require('./generarCredenciales');

test('Generar Credenciales: Secreto Base32 tiene la longitud y caracteres correctos', () => {
  const secreto = generarSecretoBase32(16);
  assert.strictEqual(secreto.length, 16);
  // Validar que solo use caracteres del alfabeto Base32 de TOTP
  const regexBase32 = /^[A-Z2-7]+$/;
  assert.strictEqual(regexBase32.test(secreto), true);
});

test('Generar Credenciales: Hash de contraseña con SHA-256 produce 64 caracteres hex', () => {
  const salt = '1234567890abcdef';
  const hash = hashPassword('MiPasswordSeguro', salt);
  assert.strictEqual(typeof hash, 'string');
  assert.strictEqual(hash.length, 64);
});

test('Generar Credenciales: Genera exactamente 8 códigos de respaldo con formato XXXX-XXXX', () => {
  const codigos = generarCodigosRespaldo(8);
  assert.strictEqual(codigos.length, 8);
  const regexRespaldo = /^[0-9A-F]{4}-[0-9A-F]{4}$/;
  for (const codigo of codigos) {
    assert.strictEqual(regexRespaldo.test(codigo), true);
  }
});

test('Generar Credenciales: Procesamiento completo para un usuario tipo doctor', () => {
  const body = {
    correo: 'doctor@hospital.com',
    password: 'Password123',
    rol: 'doctor',
    especialidad_id: '3'
  };

  const resultado = procesarRegistro(body);

  assert.strictEqual(resultado.correo, 'doctor@hospital.com');
  assert.strictEqual(resultado.rol, 'doctor');
  assert.strictEqual(resultado.especialidad_id, 3);
  assert.strictEqual(resultado.salt.length, 16); // 8 bytes en hex son 16 chars
  assert.strictEqual(resultado.password_hash.length, 64);
  assert.strictEqual(resultado.totp_secret.length, 16);
  assert.strictEqual(resultado.codigos_respaldo.length, 8);
});