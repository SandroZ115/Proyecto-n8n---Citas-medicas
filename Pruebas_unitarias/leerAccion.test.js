const test = require('node:test');
const assert = require('node:assert');
const { leerAccion } = require('./leerAccion');

test('Leer Acción: Normaliza correctamente la acción a minúsculas y sin espacios', () => {
  const body = {
    accion: '  CREAR  ',
    nombre: 'Cardiología',
    descripcion: 'Especialidad del corazón',
    id: null,
    activo: true
  };

  const resultado = leerAccion(body);

  assert.strictEqual(resultado.accion, 'crear');
  assert.strictEqual(resultado.nombre, 'Cardiología');
  assert.strictEqual(resultado.descripcion, 'Especialidad del corazón');
  assert.strictEqual(resultado.activo, true);
});

test('Leer Acción: Asigna valor por defecto "Sin descripcion" si la descripción viene vacía u omitida', () => {
  const body = {
    accion: 'actualizar',
    nombre: 'Pediatría',
    id: 5,
    activo: false
  };

  const resultado = leerAccion(body);

  assert.strictEqual(resultado.accion, 'actualizar');
  assert.strictEqual(resultado.descripcion, 'Sin descripcion');
  assert.strictEqual(resultado.id, 5);
  assert.strictEqual(resultado.activo, false);
});

test('Leer Acción: Maneja payloads vacíos de forma segura sin arrojar excepciones', () => {
  const resultado = leerAccion({});

  assert.strictEqual(resultado.accion, '');
  assert.strictEqual(resultado.descripcion, 'Sin descripcion');
  assert.strictEqual(resultado.id, undefined);
});