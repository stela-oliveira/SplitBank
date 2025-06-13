const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Token malformatted' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token malformatted' });
  }

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Token invalid' });
    }

    try {
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found for this token.' });
      }

      req.userId = user.id; // Anexa o ID do usuário do SplitBank à requisição
      req.user = user;
      return next();
    } catch (dbError) {
      console.error("Error fetching user from DB:", dbError);
      return res.status(500).json({ message: "Internal server error during authentication check." });
    }
  });
};

module.exports = authMiddleware;