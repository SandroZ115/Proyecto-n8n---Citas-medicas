const test = require('node:test');
const assert = require('node:assert');
const { calcularBloqueoLogin } = require('./calcularBloqueoLogin');

const tiempoFijo = '2026-06-01T12:00:00.000Z';

test('Calcular Bloqueo Login: Primer fallo incrementa intentos a 1 sin bloquear', () => {
  const item = { usuario: 'Sandro', intentos_fallidos: 0, bloqueado_hasta: null };
  const resultado = calcularBloqueoLogin(item, tiempoFijo);

  assert.strictEqual(resultado.intentos_fallidos_nuevo, 1);
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, null);
});

test('Calcular Bloqueo Login: Tercer fallo consecutivo activa bloqueo de 15 minutos', () => {
  const item = { usuario: 'Sandro', intentos_fallidos: 2, bloqueado_hasta: null };
  const resultado = calcularBloqueoLogin(item, tiempoFijo);

  assert.strictEqual(resultado.intentos_fallidos_nuevo, 3);
  
  // 12:00:00 + 15 minutos = 12:15:00
  const esperadoBloqueoHasta = '2026-06-01T12:15:00.000Z';
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, esperadoBloqueoHasta);
});

test('Calcular Bloqueo Login: Intento con bloqueo previo ya vencido reinicia el contador', () => {
  // El bloqueo vence a las 11:30, el intento ocurre a las 12:00
  const item = { usuario: 'Sandro', intentos_fallidos: 3, bloqueado_hasta: '2026-06-01T11:30:00.000Z' };
  const resultado = calcularBloqueoLogin(item, tiempoFijo);

  assert.strictEqual(resultado.intentos_fallidos_nuevo, 1);
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, null);
});