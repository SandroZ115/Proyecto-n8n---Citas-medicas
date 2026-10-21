const test = require('node:test');
const assert = require('node:assert');
const { armarRespuestaAgenda } = require('./armarRespuestaAgenda');

test('Armar Respuesta Agenda: Filtra registros sin ID y agrupa las citas de la agenda', () => {
  const itemsEntrada = [
    { json: { id: 201, paciente: 'Ana Gómez', fecha_hora: '2026-06-01 10:00:00' } },
    { json: { id: null, paciente: 'Registro Vacío' } }, // Debe ser filtrado
    { json: { id: 202, paciente: 'Carlos Ruiz', fecha_hora: '2026-06-01 10:30:00' } }
  ];

  const resultado = armarRespuestaAgenda(itemsEntrada);

  assert.strictEqual(Array.isArray(resultado.citas), true);
  assert.strictEqual(resultado.citas.length, 2);
  assert.strictEqual(resultado.citas[0].id, 201);
  assert.strictEqual(resultado.citas[1].id, 202);
});

test('Armar Respuesta Agenda: Retorna array vacío si no hay citas válidas en la entrada', () => {
  const itemsEntrada = [
    { json: { id: null } },
    { json: {} }
  ];

  const resultado = armarRespuestaAgenda(itemsEntrada);

  assert.strictEqual(resultado.citas.length, 0);
});