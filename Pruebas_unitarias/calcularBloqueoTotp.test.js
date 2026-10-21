const test = require('node:test');
const assert = require('node:assert');
const { calcularBloqueoTotp } = require('./calcularBloqueoTotp');

const tiempoFijo = '2026-06-01T12:00:00.000Z';

test('Calcular Bloqueo TOTP: Primer fallo incrementa intentos a 1 sin bloquear', () => {
  const sesion = { usuario_id: 5, intentos_fallidos: 0, bloqueado_hasta: null };
  const resultado = calcularBloqueoTotp(sesion, tiempoFijo);

  assert.strictEqual(resultado.usuario_id, 5);
  assert.strictEqual(resultado.intentos_fallidos_nuevo, 1);
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, null);
});

test('Calcular Bloqueo TOTP: Tercer fallo consecutivo activa bloqueo de 15 minutos', () => {
  const sesion = { usuario_id: 5, intentos_fallidos: 2, bloqueado_hasta: null };
  const resultado = calcularBloqueoTotp(sesion, tiempoFijo);

  assert.strictEqual(resultado.usuario_id, 5);
  assert.strictEqual(resultado.intentos_fallidos_nuevo, 3);
  
  // 12:00:00 + 15 minutos = 12:15:00
  const esperadoBloqueoHasta = '2026-06-01T12:15:00.000Z';
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, esperadoBloqueoHasta);
});

test('Calcular Bloqueo TOTP: Intento con bloqueo previo ya vencido reinicia el contador de fallos', () => {
  // El bloqueo anterior vencía a las 11:30, el nuevo intento ocurre a las 12:00
  const sesion = { usuario_id: 5, intentos_fallidos: 3, bloqueado_hasta: '2026-06-01T11:30:00.000Z' };
  const resultado = calcularBloqueoTotp(sesion, tiempoFijo);

  assert.strictEqual(resultado.usuario_id, 5);
  assert.strictEqual(resultado.intentos_fallidos_nuevo, 1);
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, null);
});