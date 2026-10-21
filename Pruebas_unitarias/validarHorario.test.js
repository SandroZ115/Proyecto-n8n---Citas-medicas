const test = require('node:test');
const assert = require('node:assert');
const { validarHorario } = require('./validarHorario');

// Simula que "ahora" es el 1 de junio de 2026 a las 10:00 UTC
const tiempoActual = '2026-06-01T10:00:00.000Z';

test('Validar Horario: Consulta de disponibilidad válida dentro del rango y bloques permitidos', () => {
  const body = {
    especialidad_id: 2,
    fecha_hora: '2026-06-01T15:00:00.000Z' // 15:00 UTC (09:00 Guatemala, bloque de 30 min)
  };

  const resultado = validarHorario(body, tiempoActual);

  assert.strictEqual(resultado.valido, true);
  assert.strictEqual(resultado.motivo, null);
  assert.strictEqual(resultado.especialidad_id, 2);
  assert.strictEqual(resultado.fecha_sql, '2026-06-01 15:00:00');
});

test('Validar Horario: Rechaza si falta la especialidad o es inválida', () => {
  const body = {
    especialidad_id: 0,
    fecha_hora: '2026-06-01T15:00:00.000Z'
  };

  const resultado = validarHorario(body, tiempoActual);

  assert.strictEqual(resultado.valido, false);
  assert.strictEqual(resultado.motivo, 'Falta la especialidad');
});

test('Validar Horario: Rechaza si la hora no está en bloques de 30 minutos', () => {
  const body = {
    especialidad_id: 1,
    fecha_hora: '2026-06-01T15:15:00.000Z' // Minuto 15 no es múltiplo de 30
  };

  const resultado = validarHorario(body, tiempoActual);

  assert.strictEqual(resultado.valido, false);
  assert.strictEqual(resultado.motivo, 'Las citas son en bloques de 30 minutos (:00 o :30)');
});

test('Validar Horario: Rechaza si la fecha solicitada está en el pasado', () => {
  const body = {
    especialidad_id: 1,
    fecha_hora: '2026-05-01T15:00:00.000Z' // Fecha pasada respecto a tiempoActual
  };

  const resultado = validarHorario(body, tiempoActual);

  assert.strictEqual(resultado.valido, false);
  assert.strictEqual(resultado.motivo, 'La cita debe ser en el futuro');
});

test('Validar Horario: Rechaza si la hora está fuera del horario de atención (ej. muy temprano)', () => {
  const body = {
    especialidad_id: 1,
    fecha_hora: '2026-06-01T13:00:00.000Z' // 13:00 UTC equivaldría a las 07:00 en Guatemala (antes de las 08:00)
  };

  const resultado = validarHorario(body, tiempoActual);

  assert.strictEqual(resultado.valido, false);
  assert.strictEqual(resultado.motivo, 'Horario de atención: 08:00 a 17:00 (hora de Guatemala)');
});