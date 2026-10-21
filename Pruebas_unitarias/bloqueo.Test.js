const test = require('node:test');
const assert = require('node:assert');
const { calcularBloqueo } = require('./bloqueo');

const tiempoFijo = '2026-06-01T12:00:00.000Z';

test('Bloqueo: Primer fallo no debe bloquear y suma 1 intento', () => {
  const item = { intentos_fallidos: 0, bloqueado_hasta: null };
  const resultado = calcularBloqueo(item, tiempoFijo);

  assert.strictEqual(resultado.intentos_fallidos_nuevo, 1);
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, null);
});

test('Bloqueo: Tercer fallo consecutivo debe activar el bloqueo por 15 minutos', () => {
  const item = { intentos_fallidos: 2, bloqueado_hasta: null };
  const resultado = calcularBloqueo(item, tiempoFijo);

  assert.strictEqual(resultado.intentos_fallidos_nuevo, 3);
  
  // 12:00:00 + 15 minutos = 12:15:00
  const esperadoBloqueoHasta = '2026-06-01T12:15:00.000Z';
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, esperadoBloqueoHasta);
});

test('Bloqueo: Intento con bloqueo previo ya vencido reinicia el contador de fallos', () => {
  // El bloqueo vencía a las 11:30, y el intento actual es a las 12:00
  const item = { intentos_fallidos: 3, bloqueado_hasta: '2026-06-01T11:30:00.000Z' };
  const resultado = calcularBloqueo(item, tiempoFijo);

  // Como el bloqueo venció, 'base' se vuelve 0, por lo que 0 + 1 = 1
  assert.strictEqual(resultado.intentos_fallidos_nuevo, 1);
  assert.strictEqual(resultado.bloqueado_hasta_nuevo, null);
});

test('Bloqueo: Intento con bloqueo previo aún vigente', () => {
  // El bloqueo vence a las 12:30, y el intento ocurre a las 12:00 (sigue activo)
  const item = { intentos_fallidos: 3, bloqueado_hasta: '2026-06-01T12:30:00.000Z' };
  const resultado = calcularBloqueo(item, tiempoFijo);

  // Como no está vencido, lockVencido es falso, toma intentos_fallidos (3) + 1 = 4
  assert.strictEqual(resultado.intentos_fallidos_nuevo, 4);
  assert.notStrictEqual(resultado.bloqueado_hasta_nuevo, null);
});