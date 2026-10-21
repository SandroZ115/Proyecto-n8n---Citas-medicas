function prepararDatosAgenda(body = {}, sesion = {}, ahoraCustom = null) {
  const ahora = ahoraCustom ? new Date(ahoraCustom) : new Date();
  
  const hoy = new Date(ahora);
  hoy.setUTCHours(0, 0, 0, 0);
  const porDefecto = { desde: hoy, hasta: new Date(hoy.getTime() + 30 * 24 * 3600 * 1000) };

  function fecha(valor, def) {
    const d = valor ? new Date(valor) : def;
    return isNaN(d.getTime()) ? def : d;
  }
  const fmt = d => d.toISOString().slice(0, 19).replace('T', ' ');

  const esDoctor = sesion.rol === 'doctor';
  const accion = String(body.accion || 'listar').trim().toLowerCase();
  const citaId = Number(body.cita_id || 0);
  const valida = ['listar', 'cancelar', 'completar', 'sin_asignar'].includes(accion)
    && (accion === 'listar' || accion === 'sin_asignar' || citaId > 0);

  return {
    accion,
    accion_valida: valida,
    rol: sesion.rol,
    usuario_id: Number(sesion.usuario_id),
    cita_id: citaId,
    desde: fmt(fecha(body.desde, porDefecto.desde)),
    hasta: fmt(fecha(body.hasta, porDefecto.hasta)),
    doctor_filtro: esDoctor ? Number(sesion.usuario_id) : Number(body.doctor_id || 0),
    especialidad_filtro: Number(body.especialidad_id || 0)
  };
}

module.exports = { prepararDatosAgenda };