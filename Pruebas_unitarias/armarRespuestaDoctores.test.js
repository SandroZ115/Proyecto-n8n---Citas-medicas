const test = require('node:test');
const assert = require('node:assert');
const { armarRespuestaDoctores } = require('./armarRespuestaDoctores');

test('Armar Respuesta Doctores: Filtra registros sin ID y agrupa los doctores válidos', () => {
  const itemsEntrada = [
    { json: { id: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Cardiología', disponible: true } },
    { json: { id: null, nombre: 'Registro Inválido' } }, // Debe ser filtrado
    { json: { id: 3, nombre: 'Dra. Ana Gómez', especialidad: 'Cardiología', disponible: true } }
  ];

  const resultado = armarRespuestaDoctores(itemsEntrada);

  assert.strictEqual(Array.isArray(resultado.doctores), true);
  assert.strictEqual(resultado.doctores.length, 2);
  assert.strictEqual(resultado.doctores[0].nombre, 'Dr. Juan Pérez');
  assert.strictEqual(resultado.doctores[1].nombre, 'Dra. Ana Gómez');
});

test('Armar Respuesta Doctores: Retorna array vacío si no hay doctores válidos en la entrada', () => {
  const itemsEntrada = [
    { json: { id: null } },
    { json: {} }
  ];

  const resultado = armarRespuestaDoctores(itemsEntrada);

  assert.strictEqual(resultado.doctores.length, 0);
});