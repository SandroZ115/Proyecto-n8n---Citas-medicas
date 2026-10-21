const test = require('node:test');
const assert = require('node:assert');
const { revisarBloqueo } = require('./revisarBloqueo');

const tiempoActual = '2026-06-01T12:00:00.000Z';

test('Revisar Bloqueo: Usuario sin fecha de bloqueo debe estar desbloqueado', () => {
  const item = { usuario: 'Sandro', bloqueado_hasta: null };
  const resultado = revisarBloqueo(item, tiempoActual);

  assert.strictEqual(resultado.esta_bloqueado, false);
});

test('Revisar Bloqueo: Bloqueo activo (fecha futura) debe marcar esta_bloqueado = true', () => {
  // El bloqueo vence a las 12:15, la hora actual es las 12:00
  const item = { usuario: 'Sandro', bloqueado_hasta: '2026-06-01T12:15:00.000Z' };
  const resultado = revisarBloqueo(item, tiempoActual);

  assert.strictEqual(resultado.esta_bloqueado, true);
});

test('Revisar Bloqueo: Bloqueo vencido (fecha pasada) debe marcar esta_bloqueado = false', () => {
  // El bloqueo venció a las 11:30, la hora actual es las 12:00
  const item = { usuario: 'Sandro', bloqueado_hasta: '2026-06-01T11:30:00.000Z' };
  const resultado = revisarBloqueo(item, tiempoActual);

  assert.strictEqual(resultado.esta_bloqueado, false);
});