// /backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
  let token;

  // O token é enviado no cabeçalho da requisição, no formato "Bearer TOKEN"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Pega apenas o token (remove a palavra "Bearer")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifica se o token é válido usando nosso segredo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Busca o usuário pelo ID que está dentro do token
      // e anexa o objeto do usuário na requisição (sem a senha)
      req.user = await User.findById(decoded.id).select('-password');

      // 4. Se tudo deu certo, permite que a requisição continue para o controller
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Não autorizado, token falhou' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, sem token' });
  }
};

module.exports = { protect };