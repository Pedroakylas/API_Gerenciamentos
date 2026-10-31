/**
 * src/errors/nao-encontrado.error.js
 * 
 * Responsabilidade:
 * Representar erros de recursos não encontrados na aplicação (HTTP 404).
 */

class NaoEncontradoError extends Error {
  /**
   * @param {string} [mensagem='Recurso não encontrado.'] - Descrição principal do erro.
   * @param {string[]|string} [detalhes=[]] - Lista de inconsistências detalhadas.
   */
  constructor(mensagem = 'Recurso não encontrado.', detalhes = []) {
    super(mensagem);
    this.name = 'NaoEncontradoError';
    this.statusCode = 404;
    this.detalhes = Array.isArray(detalhes) ? detalhes : [detalhes];
  }
}

module.exports = NaoEncontradoError;

