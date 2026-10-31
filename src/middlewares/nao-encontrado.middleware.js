/**
 * src/middlewares/nao-encontrado.middleware.js
 * 
 * Responsabilidade:
 * Interceptar requisições para rotas ou métodos não mapeados na aplicação,
 * retornando resposta padronizada com status HTTP 404.
 */

function naoEncontradoMiddleware(req, res, next) {
  res.status(404).json({
    erro: `Rota ${req.method} ${req.originalUrl} não encontrada.`,
    detalhes: [
      'Verifique o método HTTP utilizado e o caminho da URL informada.'
    ]
  });
}

module.exports = naoEncontradoMiddleware;

