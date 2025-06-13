require('dotenv').config();

module.exports = {
  miniBancoCentral: {
    url: process.env.MINI_BANCO_CENTRAL_API_URL || 'http://localhost:3001',
  },
  apiBancoCentral: {
    url: process.env.API_BANCO_CENTRAL_API_URL || 'http://localhost:3002',
  }
};