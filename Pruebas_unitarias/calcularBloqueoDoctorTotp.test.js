const test = require('node:test');
const assert = require('node:assert');
const { calcularBloqueoDoctorTotp } = require('./calcularBloqueoDoctorTotp');

const tiempoFijo = '2026-06-01T12:00:00.000Z';

test('Calcular Bloqueo Doctor TOTP: Primer fallo incrementa intentos a 1 sin bloquear', () => {
  const item = { doctor_id: 4, intentos_fallidos: 0, bloqueado_hasta: null };
  const resultado = calcularBloqueoDoctorTotp(item, tiempoFijo);

  assert.strictEqual(resultado.intentos_fallidos_nuevo, 1);
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, null);
});

test('Calcular Bloqueo Doctor TOTP: Tercer fallo consecutivo activa bloqueo de 15 minutos', () => {
  const item = { doctor_id: 4, intentos_fallidos: 2, bloqueado_hasta: null };
  const resultado = calcularBloqueoDoctorTotp(item, tiempoFijo);

  assert.strictEqual(resultado.intentos_fallidos_nuevo, 3);
  
  // 12:00:00 + 15 minutos = 12:15:00
  const esperadoBloqueoHasta = '2026-06-01T12:15:00.000Z';
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, esperadoBloqueoHasta);
});

test('Calcular Bloqueo Doctor TOTP: Intento con bloqueo previo ya vencido reinicia el contador de fallos', () => {
  // El bloqueo anterior vencía a las 11:30, el nuevo intento ocurre a las 12:00
  const item = { doctor_id: 4, intentos_fallidos: 3, bloqueado_hasta: '2026-06-01T11:30:00.000Z' };
  const resultado = calcularBloqueoDoctorTotp(item, tiempoFijo);

  assert.strictEqual(resultado.intentos_fallidos_nuevo, 1);
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, null);
});