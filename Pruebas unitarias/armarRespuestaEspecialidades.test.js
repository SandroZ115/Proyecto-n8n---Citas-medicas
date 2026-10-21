const test = require('node:test');
const assert = require('node:assert');
const { armarRespuesta } = require('./armarRespuestaEspecialidades');

test('Armar Respuesta Especialidades: Filtra registros sin ID y agrupa las especialidades válidas', () => {
  const itemsEntrada = [
    { json: { id: 1, nombre: 'Cardiología', activo: true } },
    { json: { id: null, nombre: 'Registro Inválido' } }, // Debe ser filtrado
    { json: { id: 2, nombre: 'Pediatría', activo: true } }
  ];

  const resultado = armarRespuesta(itemsEntrada);

  assert.strictEqual(Array.isArray(resultado.especialidades), true);
  assert.strictEqual(resultado.especialidades.length, 2);
  assert.strictEqual(resultado.especialidades[0].nombre, 'Cardiología');
  assert.strictEqual(resultado.especialidades[1].nombre, 'Pediatría');
});

test('Armar Respuesta Especialidades: Retorna array vacío si no hay elementos válidos', () => {
  const itemsEntrada = [
    { json: { id: null } },
    { json: {} }
  ];

  const resultado = armarRespuesta(itemsEntrada);

  assert.strictEqual(resultado.especialidades.length, 0);
});