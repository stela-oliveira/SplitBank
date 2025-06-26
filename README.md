# SplitBank - API Carteira Compartilhada
![image](https://github.com/user-attachments/assets/c6bf4a4c-b7de-4e7b-83cf-1e2b7d6cee5a)


![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-4.x-orange.svg)
![Sequelize](https://img.shields.io/badge/Sequelize-6.x-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13-blue.svg)
![Docker](https://img.shields.io/badge/Docker-gray.svg?logo=docker)

## 📖 Sobre o Projeto

O **SplitBank** é uma API projetada para simplificar o gerenciamento de despesas compartilhadas em grupo. A aplicação principal permite que usuários criem "carteiras" (wallets), adicionem participantes, registrem despesas e visualizem resumos detalhados.

O grande diferencial do projeto é sua **arquitetura de microsserviços e a simulação de um ecossistema de Open Finance**. Além da API principal, o sistema inclui duas APIs de "bancos externos" (`Mini Banco Central` e `ApiBancoCentral`), cada uma com seu próprio banco de dados isolado. O SplitBank pode se conectar a essas APIs para buscar dados de contas e transações, demonstrando um fluxo de integração bancária moderno e seguro.

---

## 🏛️ Arquitetura

O projeto é composto por 3 serviços principais, orquestrados com Docker Compose:

1.  **`splitbank-backend` (Porta 3000):** A aplicação principal. Gerencia carteiras, despesas, equipes e a lógica de negócio de integração com os outros bancos.
2.  **`mini-banco-central` (Porta 3001):** Uma API mock que simula um banco externo. Possui seus próprios usuários, contas e transações.
3.  **`api-banco-central` (Porta 3002):** Uma segunda API mock para simular um segundo banco externo, com funcionalidade idêntica à do `mini-banco-central`.

Cada serviço possui seu próprio banco de dados PostgreSQL, garantindo o isolamento completo e simulando um ambiente de produção real.

---

## 🛠️ Tecnologias Utilizadas

* **Backend:** Node.js, Express.js
* **Banco de Dados:** PostgreSQL
* **ORM (Object-Relational Mapping):** Sequelize
* **Containerização:** Docker & Docker Compose
* **Autenticação:** JWT (JSON Web Tokens) com a biblioteca `jsonwebtoken`
* **Segurança de Senhas:** `bcryptjs` para hashing de senhas

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para subir todo o ecossistema de APIs localmente.

### Pré-requisitos

* [Docker](https://www.docker.com/get-started) instalado e em execução.
* [Docker Compose](https://docs.docker.com/compose/install/) instalado.

### Instalação e Inicialização

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    cd seu-repositorio
    ```

2.  **Verifique os arquivos `.env`:** Cada serviço de API (`backend`, `backend/apis/mini-banco-central`, `backend/apis/ApiBancoCentral`) possui seu próprio arquivo `.env`. Verifique se as portas, nomes de bancos de dados e credenciais correspondem ao que está definido no arquivo `docker-compose.yml`.

3.  **Construa as imagens e inicie os contêineres:**
    Este comando irá limpar qualquer ambiente antigo, reconstruir as imagens com o código mais recente e iniciar todos os serviços em background.

    ```bash
    docker-compose down -v && docker-compose up --build -d
    ```

Ao final do processo, as três APIs estarão rodando e prontas para receber requisições.

---

## 🧪 Guia de Testes da API (Usando Thunder Client ou similar)

Este guia mostra o fluxo completo para testar todas as funcionalidades do sistema, desde a criação de dados nos bancos externos até o uso das funcionalidades principais do SplitBank.

### Parte 1: Populando as APIs Externas

Primeiro, precisamos criar usuários e contas nos bancos externos para que o SplitBank tenha dados para consumir.

#### 1.1 - Mini Banco Central (Porta 3001)

**Requisição 1: Registrar Usuário no Mini Banco**
* **Método:** `POST`
* **URL:** `http://localhost:3001/auth/register`
* **Body (JSON):**
    ```json
    {
      "name": "Usuario Mini Banco",
      "email": "minibanco@example.com",
      "password": "password123",
      "documentNumber": "11122233344",
      "birthDate": "1990-01-01"
    }
    ```

**Requisição 2: Fazer Login no Mini Banco**
* **Método:** `POST`
* **URL:** `http://localhost:3001/auth/login`
* **Body (JSON):**
    ```json
    {
      "email": "minibanco@example.com",
      "password": "password123"
    }
    ```
* > **Ação Importante:** Na resposta, copie os valores de `token` (guarde como `minibanco_token`) e `user.id` (guarde como `minibanco_userId`).

**Requisição 3: Criar Conta no Mini Banco**
* **Método:** `POST`
* **URL:** `http://localhost:3001/accounts`
* **Auth:** Bearer Token -> Cole o `minibanco_token`.
* **Body (JSON):** (Substitua o `userId` pelo valor que você copiou)
    ```json
    {
      "userId": "COLE_SEU_MINIBANCO_USERID_AQUI",
      "accountNumber": "12345-6",
      "agencyNumber": "0001",
      "balance": 1500.75,
      "accountType": "Corrente"
    }
    ```
* > **Ação Importante:** Na resposta, copie o `id` da conta criada (guarde como `minibanco_accountId`).

**Requisição 4: Criar uma Transação no Mini Banco**
* **Método:** `POST`
* **URL:** `http://localhost:3001/transactions`
* **Auth:** Bearer Token -> Cole o `minibanco_token`.
* **Body (JSON):** (Substitua o `accountId` pelo valor que você copiou)
    ```json
    {
      "accountId": "COLE_SEU_MINIBANCO_ACCOUNTID_AQUI",
      "type": "DEBIT",
      "amount": 75.50,
      "description": "Compra no supermercado"
    }
    ```
* **Atenção para povoar a outra api (ApiBancoCentral) basta trocar o localhost para:** `3002`
  
---

### Parte 2: Autenticando e Integrando no SplitBank

Agora vamos interagir com a API principal.

**Requisição 5: Registrar Usuário no SplitBank**
* **Método:** `POST`
* **URL:** `http://localhost:3000/api/auth/register`
* **Body (JSON):** (Use o mesmo CPF/documentNumber do usuário do Mini Banco)
    ```json
    {
      "name": "Usuario SplitBank Principal",
      "email": "splitbank@example.com",
      "password": "password789",
      "cpf": "11122233344",
      "phone": "11987654321",
      "birthDate": "1995-03-03"
    }
    ```

**Requisição 6: Fazer Login no SplitBank**
* **Método:** `POST`
* **URL:** `http://localhost:3000/api/auth/login`
* **Body (JSON):**
    ```json
    {
      "cpf": "11122233344",
      "password": "password789"
    }
    ```
* > **Ação Importante:** Na resposta, copie o valor do `token` (guarde como `splitbank_token`).

**Requisição 7: Conectar ao Banco Externo (Open Finance)**
* **Método:** `POST`
* **URL:** `http://localhost:3000/api/open-finance/connect-bank`
* **Auth:** Bearer Token -> Cole o `splitbank_token`.
* **Body (JSON):** (Substitua pelo `minibanco_token`)
    ```json
    {
      "bankId": "miniBancoCentral",
      "simulatedAuthToken": "COLE_SEU_MINIBANCO_TOKEN_AQUI"
    }
    ```

**Requisição 8: Buscar Contas do Mini Banco (via SplitBank)**
* **Método:** `GET`
* **URL:** `http://localhost:3000/api/open-finance/mini-banco-central/accounts`
* **Auth:** Bearer Token -> Cole o `splitbank_token`.

**Requisição 9: Buscar Transações do Mini Banco (via SplitBank)**
* **Método:** `GET`
* **URL:** `http://localhost:3000/api/open-finance/mini-banco-central/transactions/COLE_SEU_MINIBANCO_ACCOUNTID_AQUI`
* **Auth:** Bearer Token -> Cole o `splitbank_token`.

---

### Parte 3: Testando as Funcionalidades Principais do SplitBank

**Requisição 10: Criar uma Carteira (Wallet)**
* **Método:** `POST`
* **URL:** `http://localhost:3000/api/wallets`
* **Auth:** Bearer Token -> Cole o `splitbank_token`.
* **Body (JSON):**
    ```json
    {
      "name": "Viagem para a Praia",
      "description": "Despesas da viagem da praia."
    }
    ```
* > **Ação Importante:** Na resposta, copie o `id` da carteira criada (guarde como `wallet_id`).

**Requisição 11: Adicionar Participante à Carteira**
* *Pré-requisito:* Crie um segundo usuário no SplitBank (com email e CPF diferentes).
* **Método:** `POST`
* **URL:** `http://localhost:3000/api/team/COLE_SEU_WALLET_ID_AQUI/participants`
* **Auth:** Bearer Token -> Use o token do **criador da carteira (admin)**.
* **Body (JSON):**
    ```json
    {
      "email": "convidado@example.com"
    }
    ```

**Requisição 12: Adicionar uma Despesa**
* **Método:** `POST`
* **URL:** `http://localhost:3000/api/expenses/COLE_SEU_WALLET_ID_AQUI`
* **Auth:** Bearer Token -> Cole o `splitbank_token`.
* **Body (JSON):**
    ```json
    {
      "description": "Jantar no restaurante",
      "value": 150.50,
      "category": "Alimentação"
    }
    ```

**Requisição 13: Ver Resumo da Home**
* **Método:** `GET`
* **URL:** `http://localhost:3000/api/wallets/summary`
* **Auth:** Bearer Token -> Cole o `splitbank_token`.

**Requisição 14: Ver Despesas por Categoria**
* **Método:** `GET`
* **URL:** `http://localhost:3000/api/expenses/COLE_SEU_WALLET_ID_AQUI/category/Alimentação`
* **Auth:** Bearer Token -> Cole o `splitbank_token`.

**Requisição 15: Ver Resumo da Equipe**
* **Método:** `GET`
* **URL:** `http://localhost:3000/api/team/COLE_SEU_WALLET_ID_AQUI/summary`
* **Auth:** Bearer Token -> Cole o `splitbank_token`.

**Requisição 16: Ver Perfil do Usuário Logado**
* **Método:** `GET`
* **URL:** `http://localhost:3000/api/users/me`
* **Auth:** Bearer Token -> Cole o `splitbank_token`.

## 👥 Participantes
- **Stela de Oliveira** - (https://github.com/stela-oliveira)
- **Luiz Fernando Kerico** - (https://github.com/fernandokerico)
- **Ana Luisa de Abreu Santos** - (https://github.com/cCarpa25)
- **Rafaela Pereira Oleiro** - (https://github.com/RafaelaOleiro)
- **Fernanda Bolestao** - (https://github.com/febolesta)
- **Eduarda Siqueira de Moura** - (https://github.com/eduardasiq-moura)
