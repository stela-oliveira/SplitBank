const express = require('express');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Rota protegida: apenas usuários autenticados no SplitBank podem ver seu próprio perfil
router.get('/me', authMiddleware, UserController.getMe);

module.exports = router;