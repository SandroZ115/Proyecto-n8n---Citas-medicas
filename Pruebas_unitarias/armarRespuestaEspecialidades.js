function armarRespuesta(items = []) {
  const especialidades = items.map(i => i.json).filter(e => e.id);
  return { especialidades };
}

module.exports = { armarRespuesta };