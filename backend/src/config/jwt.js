require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 
  'jwt_para_splitbank_backend', // Use a chave do .env
  expiresIn: '1d', // Token expira em 1 dia
};