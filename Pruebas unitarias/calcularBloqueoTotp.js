function calcularBloqueoTotp(sesion, ahoraCustom = null) {
  const ahora = ahoraCustom ? new Date(ahoraCustom) : new Date();

  const lockVencido = sesion.bloqueado_hasta && new Date(sesion.bloqueado_hasta) <= ahora;
  const intentos = (lockVencido ? 0 : (sesion.intentos_fallidos || 0)) + 1;
  const debeBloquear = intentos >= 3;

  let bloqueadoHastaNuevo = null;
  if (debeBloquear) {
    bloqueadoHastaNuevo = new Date(ahora.getTime() + 15 * 60 * 1000).toISOString();
  }

  return {
    usuario_id: sesion.usuario_id,
    intentos_fallidos_nuevo: intentos,
    bloqueado_hasta_nuevo: bloqueadoHastaNuevo
  };
}

module.exports = { calcularBloqueoTotp };