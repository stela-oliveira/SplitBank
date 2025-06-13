const { ExternalToken } = require('../models');
const apiConfig = require('../config/apiConfig'); // Para acessar configurações de API

// Middleware para verificar a permissão de acesso a dados bancários externos
// bankIdKey deve ser 'miniBancoCentral' ou 'apiBancoCentral' conforme configurado em apiConfig.js
const openFinanceAuth = (bankIdKey) => async (req, res, next) => {
  try {
    const userId = req.userId; // Vem do JWT do SplitBank (middleware 'auth' deve ser executado antes)

    if (!userId) {
      return res.status(401).json({ message: "SplitBank user not authenticated for external bank access." });
    }

    // Busca o token de acesso da API externa para este usuário
    const externalTokenRecord = await ExternalToken.findOne({
      where: { userId, bankId: bankIdKey }
    });

    if (!externalTokenRecord || !externalTokenRecord.accessToken) {
      return res.status(403).json({ message: `Access to ${bankIdKey} data denied. User has not connected this bank or token is missing.` });
    }

    req.externalBankToken = externalTokenRecord.accessToken; // Anexa o token externo à requisição
    req.externalBankApiUrl = apiConfig[bankIdKey].url; // Anexa a URL base da API externa
    next();
  } catch (error) {
    console.error(`Erro no middleware openFinanceAuth para ${bankIdKey}:`, error);
    return res.status(500).json({ message: "Erro interno ao verificar autenticação de banco externo." });
  }
};

module.exports = openFinanceAuth;