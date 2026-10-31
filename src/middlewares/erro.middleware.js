/**
 * src/middlewares/erro.middleware.js
 * 
 * Responsabilidade:
 * Middleware global de tratamento de erros. Garante que nenhuma exceção vaze
 * stack traces para o cliente e que todos os erros sigam o padrão:
 * { "erro": "mensagem", "detalhes": ["..."] }
 */

// eslint-disable-next-line no-unused-vars
function erroMiddleware(err, req, res, next) {
  // Tratamento específico para JSON malformado enviado pelo cliente
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      erro: 'JSON malformado.',
      detalhes: [
        'O corpo da requisição contém sintaxe JSON inválida. Verifique vírgulas, aspas e chaves.'
      ]
    });
  }

  // Tratamento de erros conhecidos com código HTTP definido (ex.: 400, 404)
  if (err.statusCode && typeof err.statusCode === 'number') {
    const detalhes = Array.isArray(err.detalhes) && err.detalhes.length > 0
      ? err.detalhes
      : [err.message];

    return res.status(err.statusCode).json({
      erro: err.message,
      detalhes
    });
  }

  // Tratamento de erros inesperados (HTTP 500)
  // Stack trace nunca é vazado ao cliente por motivos de segurança e boas práticas
  return res.status(500).json({
    erro: 'Erro interno do servidor.',
    detalhes: [
      'Ocorreu um erro inesperado ao processar a requisição. Tente novamente mais tarde.'
    ]
  });
}

module.exports = erroMiddleware;

