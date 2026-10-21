const crypto = require('crypto');

function generarToken(item, ahoraCustom = null) {
  const ahora = ahoraCustom ? new Date(ahoraCustom) : new Date();
  
  const token = crypto.randomBytes(32).toString('hex');
  const expiraEn = new Date(ahora.getTime() + 8 * 60 * 60 * 1000).toISOString();

  return {
    ...item,
    token: token,
    expira_en: expiraEn
  };
}

module.exports = { generarToken };