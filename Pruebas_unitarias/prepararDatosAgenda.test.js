const test = require('node:test');
const assert = require('node:assert');
const { prepararDatosAgenda } = require('./prepararDatosAgenda');

const tiempoFijo = '2026-06-01T10:00:00.000Z';

test('Preparar Datos Agenda: Acción listar por defecto genera rangos y valida correctamente', () => {
  const body = {};
  const sesion = { rol: 'paciente', usuario_id: 12 };

  const resultado = prepararDatosAgenda(body, sesion, tiempoFijo);

  assert.strictEqual(resultado.accion, 'listar');
  assert.strictEqual(resultado.accion_valida, true);
  assert.strictEqual(resultado.rol, 'paciente');
  assert.strictEqual(resultado.usuario_id, 12);
  assert.strictEqual(resultado.desde, '2026-06-01 00:00:00');
  // 1 de junio + 30 días = 1 de julio de 2026
  assert.strictEqual(resultado.hasta, '2026-07-01 00:00:00');
  assert.strictEqual(resultado.doctor_filtro, 0);
});

test('Preparar Datos Agenda: Acción cancelar con cita_id válido marca accion_valida como true', () => {
  const body = { accion: 'cancelar', cita_id: 45 };
  const sesion = { rol: 'paciente', usuario_id: 12 };

  const resultado = prepararDatosAgenda(body, sesion, tiempoFijo);

  assert.strictEqual(resultado.accion, 'cancelar');
  assert.strictEqual(resultado.accion_valida, true);
  assert.strictEqual(resultado.cita_id, 45);
});

test('Preparar Datos Agenda: Acción cancelar sin cita_id marca accion_valida como false', () => {
  const body = { accion: 'cancelar' }; // Falta cita_id
  const sesion = { rol: 'paciente', usuario_id: 12 };

  const resultado = prepararDatosAgenda(body, sesion, tiempoFijo);

  assert.strictEqual(resultado.accion, 'cancelar');
  assert.strictEqual(resultado.accion_valida, false);
});

test('Preparar Datos Agenda: Doctor asigna automáticamente su propio ID como doctor_filtro', () => {
  const body = { accion: 'listar' };
  const sesion = { rol: 'doctor', usuario_id: 5 };

  const resultado = prepararDatosAgenda(body, sesion, tiempoFijo);

  assert.strictEqual(resultado.rol, 'doctor');
  assert.strictEqual(resultado.doctor_filtro, 5);
});