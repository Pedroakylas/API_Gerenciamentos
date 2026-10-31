/**
 * src/errors/index.js
 * 
 * Responsabilidade:
 * Ponto de exportação unificado para as classes de erro personalizadas.
 */

const RequisicaoInvalidaError = require('./requisicao-invalida.error');
const NaoEncontradoError = require('./nao-encontrado.error');

module.exports = {
  RequisicaoInvalidaError,
  NaoEncontradoError
};

