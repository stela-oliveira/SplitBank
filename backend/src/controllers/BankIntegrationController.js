const ExternalBankApiService = require('../services/ExternalBankApiService');
const { ExternalToken, User } = require('../models'); // Importa User para encontrar o CPF/ID externo se necessário

class BankIntegrationController {
  async connectBank(req, res, next) {
    try {
      const { bankId, simulatedAuthToken } = req.body;
      const userId = req.userId; // ID do usuário logado no SplitBank

      if (!bankId || !simulatedAuthToken) {
        return res.status(400).json({ message: 'Bank ID and simulated authentication token are required.' });
      }

      const [externalToken, created] = await ExternalToken.findOrCreate({
        where: { userId, bankId },
        defaults: { accessToken: simulatedAuthToken }
      });

      if (!created) {
        await externalToken.update({ accessToken: simulatedAuthToken });
      }

      return res.status(200).json({
        message: `Bank ${bankId} connected successfully.`,
        externalTokenId: externalToken.id,
        isNewConnection: created
      });
    } catch (error) {
      next(error);
    }
  }

  // Método para buscar dados do usuário na API bancária externa
  async getExternalBankUser(req, res, next) {
    try {
      const userId = req.userId; // ID do usuário do SplitBank
      const externalBankToken = req.externalBankToken;
      const externalBankApiUrl = req.externalBankApiUrl;

      // Em um cenário real, você buscaria o ID do usuário externo associado ao userId do SplitBank
      // Ou usaria o CPF do usuário do SplitBank para buscar no banco externo
      const splitbankUser = await User.findByPk(userId, { attributes: ['cpf'] });
      if (!splitbankUser) {
        return res.status(404).json({ message: 'SplitBank user not found.' });
      }

      // Assumindo que o ID do usuário na API externa é o CPF do usuário do SplitBank para simplificação
      const bankUserId = splitbankUser.cpf;

      const bankUser = await ExternalBankApiService.getBankUser(externalBankApiUrl, externalBankToken, bankUserId);
      return res.status(200).json(bankUser);
    } catch (error) {
      next(error);
    }
  }

  // Método para buscar contas bancárias na API bancária externa
  async getExternalBankAccounts(req, res, next) {
    try {
      const userId = req.userId;
      const externalBankToken = req.externalBankToken;
      const externalBankApiUrl = req.externalBankApiUrl;

      const splitbankUser = await User.findByPk(userId, { attributes: ['cpf'] });
      if (!splitbankUser) {
        return res.status(404).json({ message: 'SplitBank user not found.' });
      }
      const bankUserId = splitbankUser.cpf; // Usando CPF como ID externo

      const bankAccounts = await ExternalBankApiService.getBankAccounts(externalBankApiUrl, externalBankToken, bankUserId);
      return res.status(200).json(bankAccounts);
    } catch (error) {
      next(error);
    }
  }

  // Método para buscar contas bancárias na API bancária externa (CORRIGIDO)
  async getExternalBankAccounts(req, res, next) {
    try {
      const userId = req.userId; // ID do usuário do SplitBank
      const externalBankToken = req.externalBankToken;
      const externalBankApiUrl = req.externalBankApiUrl;

      const splitbankUser = await User.findByPk(userId, { attributes: ['cpf'] });
      if (!splitbankUser) {
        return res.status(404).json({ message: 'SplitBank user not found.' });
      }
      
      const userCpf = splitbankUser.cpf;

      // ---- NOVA LÓGICA ----
      // Passo 1: Buscar o usuário na API externa usando o CPF para obter o UUID.
      const externalUser = await ExternalBankApiService.getBankUserByDocument(externalBankApiUrl, externalBankToken, userCpf);
      
      if (!externalUser || !externalUser.id) {
          return res.status(404).json({ message: 'User not found in the external bank with the provided CPF.'});
      }

      const externalUserId = externalUser.id; // Este é o UUID do usuário no banco externo

      // Passo 2: Usar o UUID correto para buscar as contas.
      const bankAccounts = await ExternalBankApiService.getBankAccounts(externalBankApiUrl, externalBankToken, externalUserId);
      return res.status(200).json(bankAccounts);

    } catch (error) {
      // Adiciona um log mais detalhado do erro da API externa
      if (error.response) {
        console.error('External API Error:', error.response.data);
      }
      next(error);
    }
  }

  // Método para buscar transações de uma conta bancária externa
  async getExternalBankTransactions(req, res, next) {
    try {
      const { accountId } = req.params; // ID da conta bancária na API externa
      const externalBankToken = req.externalBankToken;
      const externalBankApiUrl = req.externalBankApiUrl;

      const bankTransactions = await ExternalBankApiService.getBankTransactions(externalBankApiUrl, externalBankToken, accountId);
      return res.status(200).json(bankTransactions);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BankIntegrationController();