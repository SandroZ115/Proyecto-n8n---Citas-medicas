function armarRespuestaDoctores(items = []) {
  const doctores = items.map(i => i.json).filter(d => d.id);
  return { doctores };
}

module.exports = { armarRespuestaDoctores };