require('dotenv').config();

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  define: {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    underscored: true, // Usa snake_case para nomes de colunas no DB
    underscoredAll: true, // Converte nomes de modelos para snake_case plural no DB (ex: User -> users)
  },
  logging: false, // Desabilita o log de queries do Sequelize
};