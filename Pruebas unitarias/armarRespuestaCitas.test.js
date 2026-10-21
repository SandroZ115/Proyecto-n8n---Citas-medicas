const test = require('node:test');
const assert = require('node:assert');
const { armarRespuestaCitas } = require('./armarRespuestaCitas');

test('Armar Respuesta Citas: Filtra registros sin ID y agrupa las citas válidas', () => {
  const itemsEntrada = [
    { json: { id: 101, paciente: 'Carlos Pérez', estado: 'pendiente_aprobacion' } },
    { json: { id: null, paciente: 'Registro Fantasma' } }, // Debe ser filtrado
    { json: { id: 102, paciente: 'María López', estado: 'asignada' } }
  ];

  const resultado = armarRespuestaCitas(itemsEntrada);

  assert.strictEqual(Array.isArray(resultado.citas), true);
  assert.strictEqual(resultado.citas.length, 2);
  assert.strictEqual(resultado.citas[0].id, 101);
  assert.strictEqual(resultado.citas[1].id, 102);
});

test('Armar Respuesta Citas: Retorna array vacío si no hay citas válidas en la entrada', () => {
  const itemsEntrada = [
    { json: { id: null } },
    { json: {} }
  ];

  const resultado = armarRespuestaCitas(itemsEntrada);

  assert.strictEqual(resultado.citas.length, 0);
});