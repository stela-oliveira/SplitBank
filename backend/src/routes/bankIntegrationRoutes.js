const express = require('express');
const BankIntegrationController = require('../controllers/BankIntegrationController');
const authMiddleware = require('../middlewares/auth');
const openFinanceAuth = require('../middlewares/openFinanceAuth');

const router = express.Router();

// Rota para conectar o SplitBank a um banco externo (receber o token)
router.post('/connect-bank', authMiddleware, BankIntegrationController.connectBank);

// Rotas para buscar dados de APIs bancárias externas
// Exigem autenticação do SplitBank E consentimento para a API externa
router.get('/mini-banco-central/users/:bankUserId', authMiddleware, openFinanceAuth('miniBancoCentral'), BankIntegrationController.getExternalBankUser);
router.get('/mini-banco-central/accounts', authMiddleware, openFinanceAuth('miniBancoCentral'), BankIntegrationController.getExternalBankAccounts); // removi o :userId daqui, pois o userId vem do req.userId do SplitBank
router.get('/mini-banco-central/transactions/:accountId', authMiddleware, openFinanceAuth('miniBancoCentral'), BankIntegrationController.getExternalBankTransactions);

router.get('/api-banco-central/users/:bankUserId', authMiddleware, openFinanceAuth('apiBancoCentral'), BankIntegrationController.getExternalBankUser);
router.get('/api-banco-central/accounts', authMiddleware, openFinanceAuth('apiBancoCentral'), BankIntegrationController.getExternalBankAccounts); // removi o :userId daqui
router.get('/api-banco-central/transactions/:accountId', authMiddleware, openFinanceAuth('apiBancoCentral'), BankIntegrationController.getExternalBankTransactions);


module.exports = router;