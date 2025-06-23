const axios = require('axios');

class ExternalBankApiService {
  constructor() {
  }

  _createAxiosInstance(baseUrl, authToken = null) {
    return axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });
  }

  async get(baseUrl, authToken, endpoint) {
    const fullUrl = `${baseUrl}${endpoint}`;
    console.log(`[DEBUG] ExternalBankApiService: Tentando fazer GET para a URL: ${fullUrl}`);

    try {
      const api = this._createAxiosInstance(baseUrl, authToken);
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar dados de ${endpoint} da API externa (${baseUrl}):`, error.message);
      if (error.response) {
        console.error('Dados do Erro da API Externa:', error.response.data);
      }
      throw new Error(`Falha ao conectar com a API externa: ${error.message}`);
    }
  }


  async post(baseUrl, authToken, endpoint, data) {
    const fullUrl = `${baseUrl}${endpoint}`;
    console.log(`[DEBUG] ExternalBankApiService: Tentando fazer POST para a URL: ${fullUrl}`);
    try {
      const api = this._createAxiosInstance(baseUrl, authToken);
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao enviar dados para ${endpoint} da API externa (${baseUrl}):`, error.message);
      if (error.response) {
        console.error('Dados do Erro da API Externa:', error.response.data);
      }
      throw new Error(`Falha ao conectar com a API externa: ${error.message}`);
    }
  }

  async getBankUserByDocument(bankApiUrl, bankToken, documentNumber) {
    return this.get(bankApiUrl, bankToken, `/users/document/${documentNumber}`);
  }

  async getBankUser(bankApiUrl, bankToken, userId) {
    return this.get(bankApiUrl, bankToken, `/users/${userId}`);
  }

  async getBankAccounts(bankApiUrl, bankToken, userId) {
    return this.get(bankApiUrl, bankToken, `/accounts/user/${userId}`);
  }

  async getBankTransactions(bankApiUrl, bankToken, accountId) {
    return this.get(bankApiUrl, bankToken, `/transactions/account/${accountId}`);
  }

  async requestBankAccessToken(bankApiUrl, authCode, clientId, clientSecret) {
    return this.post(bankApiUrl, null, '/auth/token', {
      grant_type: 'authorization_code',
      code: authCode,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: 'http://localhost:3000/api/open-finance/callback'
    });
  }
}

module.exports = new ExternalBankApiService();