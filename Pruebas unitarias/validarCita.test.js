const test = require('node:test');
const assert = require('node:assert');
const { validarCita } = require('./validarCita');

// Simulamos que "ahora" es el 1 de junio de 2026 a las 10:00 UTC
const tiempoActual = '2026-06-01T10:00:00.000Z';

test('Validar Cita: Cita válida agendada por paciente', () => {
  const body = {
    nombre_paciente: 'Carlos Pérez',
    correo_paciente: 'carlos@example.com',
    urgencia: 'normal',
    especialidad_id: 1,
    doctor_id: 2,
    fecha_hora: '2026-06-01T15:00:00.000Z' // 15:00 UTC (09:00 Guatemala, bloque de 30 min)
  };
  const sesion = { usuario_id: 10, rol: 'paciente' };

  const res = validarCita(body, sesion, tiempoActual);

  assert.strictEqual(res.valido, true);
  assert.strictEqual(res.motivo, null);
  assert.strictEqual(res.estado_cita, 'pendiente_aprobacion');
  assert.strictEqual(res.requiere_totp, false);
});

test('Validar Cita: Rechaza si la cita no está en bloques de 30 minutos', () => {
  const body = {
    nombre_paciente: 'Carlos Pérez',
    urgencia: 'normal',
    especialidad_id: 1,
    doctor_id: 2,
    fecha_hora: '2026-06-01T15:15:00.000Z' // Minuto 15 no es múltiplo de 30
  };
  const sesion = { usuario_id: 10, rol: 'paciente' };

  const res = validarCita(body, sesion, tiempoActual);

  assert.strictEqual(res.valido, false);
  assert.strictEqual(res.motivo, 'Las citas son en bloques de 30 minutos (:00 o :30)');
});

test('Validar Cita: Rechaza cita en el pasado', () => {
  const body = {
    nombre_paciente: 'Carlos Pérez',
    urgencia: 'normal',
    especialidad_id: 1,
    doctor_id: 2,
    fecha_hora: '2026-05-01T15:00:00.000Z' // Fecha pasada respecto a tiempoActual
  };
  const sesion = { usuario_id: 10, rol: 'paciente' };

  const res = validarCita(body, sesion, tiempoActual);

  assert.strictEqual(res.valido, false);
  assert.strictEqual(res.motivo, 'La cita debe ser en el futuro');
});

test('Validar Cita: Doctor requiere TOTP válido de 6 dígitos', () => {
  const body = {
    nombre_paciente: 'María López',
    urgencia: 'alta',
    fecha_hora: '2026-06-01T16:00:00.000Z',
    codigo_totp: '123' // TOTP incompleto
  };
  const sesion = { usuario_id: 5, rol: 'doctor', especialidad_id: 1 };

  const res = validarCita(body, sesion, tiempoActual);

  assert.strictEqual(res.valido, false);
  assert.strictEqual(res.motivo, 'El código debe tener 6 dígitos');
});

test('Validar Cita: Urgencia alta sin doctor seleccionado en paciente genera error', () => {
  const body = {
    nombre_paciente: 'Carlos Pérez',
    urgencia: 'alta',
    especialidad_id: 1,
    doctor_id: 'cualquiera', // ID doctor 0
    fecha_hora: '2026-06-01T15:00:00.000Z'
  };
  const sesion = { usuario_id: 10, rol: 'paciente' };

  const res = validarCita(body, sesion, tiempoActual);

  assert.strictEqual(res.valido, false);
  assert.strictEqual(res.motivo, 'En urgencias hay que elegir un doctor');
});