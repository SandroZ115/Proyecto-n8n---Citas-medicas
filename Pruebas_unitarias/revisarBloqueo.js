function revisarBloqueo(item, ahoraCustom = null) {
  const ahora = ahoraCustom ? new Date(ahoraCustom) : new Date();
  const bloqueado = item.bloqueado_hasta && new Date(item.bloqueado_hasta) > ahora;

  return {
    ...item,
    esta_bloqueado: !!bloqueado
  };
}

module.exports = { revisarBloqueo };