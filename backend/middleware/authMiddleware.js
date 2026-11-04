const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Autenticação necessária.'
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não configurado.');

    return res.status(500).json({
      message: 'Configuração de autenticação indisponível.'
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: 'Token não fornecido.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Acesso permitido somente para administradores.'
      });
    }

    req.user = decoded;
    return next();

  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido ou expirado.'
    });
  }
}

module.exports = authMiddleware;

