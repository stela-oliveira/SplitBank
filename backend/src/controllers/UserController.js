const { User } = require('../models');

class UserController {
  async getMe(req, res, next) {
    try {
      // req.userId é definido pelo middleware de autenticação (auth.js)
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password'] } // Garante que a senha nunca seja retornada
      });

      if (!user) {
        return res.status(404).json({ message: 'User profile not found.' });
      }

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();