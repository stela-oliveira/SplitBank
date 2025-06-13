require('dotenv').config();
const express = require('express');
const cors = require('cors');
const databaseConfig = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Importa a instância do Sequelize e os modelos do index.js
const db = require('./models'); // 'db' conterá sequelize, Sequelize e todos os modelos

// Rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const teamRoutes = require('./routes/teamRoutes');
const bankIntegrationRoutes = require('./routes/bankIntegrationRoutes'); // Nova rota

const app = express();
const port = process.env.PORT || 3000;

// Configuração do CORS
app.use(cors());

// Middleware para parsear o corpo das requisições como JSON
app.use(express.json());

const sequelize = db.sequelize;

// Comentei para evitar que ele sobreponha as migrações.
// sequelize.sync()
//   .then(() => {
//     console.log('Database synced successfully.');
//   })
//   .catch((err) => {
//     console.error('Error syncing database:', err);
//   });

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/open-finance', bankIntegrationRoutes);

// Rota de teste simples
app.get('/', (req, res) => {
  res.send('SplitBank Backend API is running!');
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicia o servidor
app.listen(port, () => {
  console.log(`SplitBank Backend API listening at http://localhost:${port}`);
});