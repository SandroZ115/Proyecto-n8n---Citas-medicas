const crypto = require('crypto');

function base32Decode(base32) {
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of base32.toUpperCase()) {
    const val = alfabeto.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

function generarTOTP(secretBase32, tiempoCustom = null) {
  const step = 30;
  const tiempo = tiempoCustom !== null ? tiempoCustom : Math.floor(Date.now() / 1000 / step);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(tiempo));
  const key = base32Decode(secretBase32);
  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const codigo = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
  return (codigo % 1000000).toString().padStart(6, '0');
}

function validarCodigoTotpAprobar(item, codigoRecibido, tiempoCustom = null) {
  const codigoEsperado = generarTOTP(item.totp_secret, tiempoCustom);
  return {
    ...item,
    codigo_recibido: String(codigoRecibido),
    codigo_esperado: codigoEsperado,
    es_valido: String(codigoRecibido) === codigoEsperado
  };
}

module.exports = { base32Decode, generarTOTP, validarCodigoTotpAprobar };