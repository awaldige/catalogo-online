const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Verifica se o header existe e está no formato correto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Você pode checar permissões aqui se quiser, ex:
    // if (!decoded.isAdmin) return res.status(403).json({ message: 'Acesso negado' });

    req.user = decoded; // salva os dados decodificados do token
    next(); // segue para a próxima rota/middleware
  } catch (err) {
    console.error('Erro ao verificar token:', err.message);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

module.exports = authMiddleware;
