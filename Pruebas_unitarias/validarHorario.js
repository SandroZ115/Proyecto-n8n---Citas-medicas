function validarHorario(body = {}, ahoraCustom = null) {
  const ahora = ahoraCustom ? new Date(ahoraCustom) : new Date();
  const especialidadId = Number(body.especialidad_id);
  const fecha = new Date(body.fecha_hora);

  let motivo = null;
  if (!Number.isInteger(especialidadId) || especialidadId <= 0) {
    motivo = 'Falta la especialidad';
  } else if (isNaN(fecha.getTime())) {
    motivo = 'Fecha y hora inválidas';
  } else if (fecha.getUTCMinutes() % 30 !== 0 || fecha.getUTCSeconds() !== 0) {
    motivo = 'Las citas son en bloques de 30 minutos (:00 o :30)';
  } else if (fecha <= ahora) {
    motivo = 'La cita debe ser en el futuro';
  } else {
    const minutos = fecha.getUTCHours() * 60 + fecha.getUTCMinutes();
    // 08:00 a 17:00 en Guatemala (UTC-6) = 14:00 a 23:00 UTC; el último bloque empieza 22:30 UTC
    if (minutos < 14 * 60 || minutos > 22 * 60 + 30) {
      motivo = 'Horario de atención: 08:00 a 17:00 (hora de Guatemala)';
    }
  }

  return {
    valido: motivo === null,
    motivo: motivo,
    especialidad_id: especialidadId,
    fecha_sql: isNaN(fecha.getTime()) ? null : fecha.toISOString().slice(0, 19).replace('T', ' ')
  };
}

module.exports = { validarHorario };