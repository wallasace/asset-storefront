const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreta_super_segura_dev';

function authMiddleware(req, res, next) {
  // O token vem no cabeçalho HTTP "Authorization: Bearer <TOKEN>"
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // Separa a palavra "Bearer" do token em si
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do Token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado.' });
  }

  // Valida o token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    // Guarda o id e role do usuário logado na requisição (req.user)
    req.user = { id: decoded.userId, role: decoded.role };
    return next(); // Libera o acesso para a rota
  });
}

module.exports = authMiddleware;