function calcularBloqueoDoctorTotp(item, ahoraCustom = null) {
  const ahora = ahoraCustom ? new Date(ahoraCustom) : new Date();

  const lockVencido = item.bloqueado_hasta && new Date(item.bloqueado_hasta) <= ahora;
  const base = lockVencido ? 0 : (item.intentos_fallidos || 0);
  const intentosActuales = base + 1;
  const debeBloquear = intentosActuales >= 3;

  let bloqueadoHasta = null;
  if (debeBloquear) {
    bloqueadoHasta = new Date(ahora.getTime() + 15 * 60 * 1000).toISOString();
  }

  return {
    ...item,
    intentos_fallidos_nuevo: intentosActuales,
    bloqueado_hasta_nuevo: bloqueadoHasta
  };
}

module.exports = { calcularBloqueoDoctorTotp };