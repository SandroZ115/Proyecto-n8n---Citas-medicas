const crypto = require('crypto');

function validarPassword(item, passwordRecibida) {
  const salt = item.salt;
  const hashEsperado = item.password_hash;

  const hashCalculado = crypto.createHash('sha256').update(passwordRecibida + salt).digest('hex');
  const passwordValida = hashCalculado === hashEsperado;

  return {
    ...item,
    password_valida: passwordValida
  };
}

module.exports = { validarPassword };