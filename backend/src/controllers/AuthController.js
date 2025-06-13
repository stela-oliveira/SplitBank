const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, cpf, phone, birthDate } = req.body;

      // Validações básicas
      if (!name || !email || !password || !cpf) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }

      if (await User.findOne({ where: { email } })) {
        return res.status(400).json({ message: 'Email already registered.' });
      }
      if (await User.findOne({ where: { cpf } })) {
        return res.status(400).json({ message: 'CPF already registered.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        cpf,
        phone,
        birthDate
      });

      // Não retorna a senha no payload da resposta
      user.password = undefined;

      // Gera um token para o usuário recém-registrado
      const token = jwt.sign({ id: user.id }, secret, { expiresIn });

      return res.status(201).json({ user, token });
    } catch (error) {
      next(error); // Passa o erro para o middleware de tratamento de erros
    }
  }

  async login(req, res, next) {
    try {
      const { cpf, password } = req.body;

      if (!cpf || !password) {
        return res.status(400).json({ message: 'CPF and password are required.' });
      }

      // Inclui a senha no escopo para comparação
      const user = await User.scope('withPassword').findOne({ where: { cpf } });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Gera o token JWT
      const token = jwt.sign({ id: user.id }, secret, { expiresIn });

      // Não retorna a senha no payload
      user.password = undefined;

      return res.status(200).json({ user, token });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();