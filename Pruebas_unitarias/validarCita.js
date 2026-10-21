function validarCita(body = {}, sesion = {}, ahoraCustom = null) {
  const ahora = ahoraCustom ? new Date(ahoraCustom) : new Date();
  const esDoctor = sesion.rol === 'doctor';

  const nombre = String(body.nombre_paciente || '').trim();
  const urgencia = String(body.urgencia || '').trim().toLowerCase();
  const fecha = new Date(body.fecha_hora);
  const codigo = String(body.codigo_totp || '').replace(/\s/g, '');
  const correo = String(body.correo_paciente || '').trim().toLowerCase();

  const especialidadId = esDoctor ? Number(sesion.especialidad_id) : Number(body.especialidad_id);
  const doctorId = esDoctor
    ? Number(sesion.usuario_id)
    : (body.doctor_id === 'cualquiera' || body.doctor_id == null ? 0 : Number(body.doctor_id));

  let motivo = null;
  if (nombre.length < 2 || nombre.length > 100) {
    motivo = 'Nombre del paciente inválido';
  } else if (correo && (correo.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo))) {
    motivo = 'Correo del paciente inválido';
  } else if (!['alta', 'normal', 'baja'].includes(urgencia)) {
    motivo = 'Urgencia inválida';
  } else if (!Number.isInteger(especialidadId) || especialidadId <= 0) {
    motivo = 'Falta la especialidad';
  } else if (!Number.isInteger(doctorId) || doctorId < 0) {
    motivo = 'Doctor inválido';
  } else if (!esDoctor && urgencia === 'alta' && doctorId === 0) {
    motivo = 'En urgencias hay que elegir un doctor';
  } else if (isNaN(fecha.getTime())) {
    motivo = 'Fecha y hora inválidas';
  } else if (fecha.getUTCMinutes() % 30 !== 0 || fecha.getUTCSeconds() !== 0) {
    motivo = 'Las citas son en bloques de 30 minutos (:00 o :30)';
  } else if (fecha <= ahora) {
    motivo = 'La cita debe ser en el futuro';
  } else if (esDoctor && !/^\d{6}$/.test(codigo)) {
    motivo = 'El código debe tener 6 dígitos';
  } else {
    const minutos = fecha.getUTCHours() * 60 + fecha.getUTCMinutes();
    if (minutos < 14 * 60 || minutos > 22 * 60 + 30) {
      motivo = 'Horario de atención: 08:00 a 17:00 (hora de Guatemala)';
    }
  }

  return {
    valido: motivo === null,
    motivo,
    nombre_paciente: nombre,
    correo_paciente: correo || 'sin-correo',
    urgencia,
    especialidad_id: especialidadId,
    doctor_id: doctorId,
    fecha_sql: isNaN(fecha.getTime()) ? null : fecha.toISOString().slice(0, 19).replace('T', ' '),
    creada_por: sesion.usuario_id,
    requiere_totp: esDoctor,
    codigo_totp: codigo,
    estado_cita: esDoctor ? 'asignada' : 'pendiente_aprobacion'
  };
}

module.exports = { validarCita };