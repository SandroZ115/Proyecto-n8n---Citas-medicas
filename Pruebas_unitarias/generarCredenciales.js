const crypto = require('crypto');

function generarSecretoBase32(longitud = 16) {
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secreto = '';
  for (let i = 0; i < longitud; i++) {
    secreto += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return secreto;
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generarCodigosRespaldo(cantidad = 8) {
  const codigos = [];
  for (let i = 0; i < cantidad; i++) {
    const parte1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const parte2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    codigos.push(`${parte1}-${parte2}`);
  }
  return codigos;
}

function procesarRegistro(body) {
  const salt = crypto.randomBytes(8).toString('hex');
  const passwordHash = hashPassword(body.password, salt);
  const totpSecret = generarSecretoBase32();
  const codigosRespaldo = generarCodigosRespaldo();

  return {
    correo: body.correo,
    password_hash: passwordHash,
    salt: salt,
    rol: body.rol,
    especialidad_id: body.rol === 'doctor' ? Number(body.especialidad_id) : null,
    totp_secret: totpSecret,
    codigos_respaldo: codigosRespaldo
  };
}

module.exports = { generarSecretoBase32, hashPassword, generarCodigosRespaldo, procesarRegistro };