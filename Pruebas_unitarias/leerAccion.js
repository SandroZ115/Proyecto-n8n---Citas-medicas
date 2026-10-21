function leerAccion(body = {}) {
  return {
    accion: String(body.accion || '').trim().toLowerCase(),
    nombre: body.nombre,
    descripcion: body.descripcion || 'Sin descripcion',
    id: body.id,
    activo: body.activo
  };
}

module.exports = { leerAccion };