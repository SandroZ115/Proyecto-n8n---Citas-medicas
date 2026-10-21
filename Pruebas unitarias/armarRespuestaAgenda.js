function armarRespuestaAgenda(items = []) {
  const citas = items.map(i => i.json).filter(c => c.id);
  return { citas };
}

module.exports = { armarRespuestaAgenda };