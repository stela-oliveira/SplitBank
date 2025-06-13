const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Rotas de autenticação (não precisam de middleware de autenticação JWT do SplitBank)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;