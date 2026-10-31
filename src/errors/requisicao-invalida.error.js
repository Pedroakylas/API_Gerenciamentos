/**
 * src/errors/requisicao-invalida.error.js
 * 
 * Responsabilidade:
 * Representar erros de validação ou de requisição malformada (HTTP 400).
 */

class RequisicaoInvalidaError extends Error {
  /**
   * @param {string} mensagem - Descrição principal do erro.
   * @param {string[]|string} [detalhes=[]] - Lista de inconsistências detalhadas.
   */
  constructor(mensagem, detalhes = []) {
    super(mensagem);
    this.name = 'RequisicaoInvalidaError';
    this.statusCode = 400;
    this.detalhes = Array.isArray(detalhes) ? detalhes : [detalhes];
  }
}

module.exports = RequisicaoInvalidaError;

