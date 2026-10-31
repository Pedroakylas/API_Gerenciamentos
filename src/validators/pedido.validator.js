/**
 * src/validators/pedido.validator.js
 * 
 * Responsabilidade:
 * Camada isolada de validação e sanitização dos dados de entrada da API.
 * Garante que tipos, limites e formatos atendam aos requisitos antes
 * do processamento pelo Service.
 */

const { TIPOS_PEDIDO, PRIORIDADES_PEDIDO, STATUS_PEDIDO } = require('../config/dominio');
const { RequisicaoInvalidaError, NaoEncontradoError } = require('../errors');

/**
 * Valida o payload de criação de um novo pedido.
 * Sanitiza campos (trim no cliente) e ignora atributos extras.
 * 
 * @param {Object} dados - Corpo da requisição recebido.
 * @returns {Object} Dados sanitizados com cliente, tipo, valor e prioridade.
 * @throws {RequisicaoInvalidaError} Se qualquer regra de validação falhar.
 */
function validarCriacao(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados) || Object.keys(dados).length === 0) {
    throw new RequisicaoInvalidaError('O corpo da requisição não pode ser vazio.', [
      'Envie um objeto JSON contendo os campos obrigatórios: cliente, tipo, valor e prioridade.'
    ]);
  }

  const erros = [];

  // Validação do campo 'cliente'
  if (dados.cliente === undefined || dados.cliente === null) {
    erros.push("O campo 'cliente' é obrigatório.");
  } else if (typeof dados.cliente !== 'string') {
    erros.push("O campo 'cliente' deve ser do tipo string.");
  } else if (dados.cliente.trim().length === 0) {
    erros.push("O campo 'cliente' não pode ser vazio ou conter apenas espaços.");
  }

  // Validação do campo 'tipo'
  if (dados.tipo === undefined || dados.tipo === null) {
    erros.push("O campo 'tipo' é obrigatório.");
  } else if (typeof dados.tipo !== 'string') {
    erros.push("O campo 'tipo' deve ser do tipo string.");
  } else if (!TIPOS_PEDIDO.includes(dados.tipo)) {
    erros.push(`O campo 'tipo' é inválido. Valores permitidos: [${TIPOS_PEDIDO.join(', ')}].`);
  }

  // Validação do campo 'valor'
  // Rejeita strings, booleanos, null, NaN e Infinity
  if (dados.valor === undefined || dados.valor === null) {
    erros.push("O campo 'valor' é obrigatório.");
  } else if (typeof dados.valor !== 'number' || !Number.isFinite(dados.valor)) {
    erros.push("O campo 'valor' deve ser um número válido (não são aceitos strings, booleanos, null, NaN ou Infinity).");
  } else if (dados.valor <= 0) {
    erros.push("O campo 'valor' deve ser maior que zero.");
  }

  // Validação do campo 'prioridade'
  if (dados.prioridade === undefined || dados.prioridade === null) {
    erros.push("O campo 'prioridade' é obrigatório.");
  } else if (typeof dados.prioridade !== 'string') {
    erros.push("O campo 'prioridade' deve ser do tipo string.");
  } else if (!PRIORIDADES_PEDIDO.includes(dados.prioridade)) {
    erros.push(`O campo 'prioridade' é inválido. Valores permitidos: [${PRIORIDADES_PEDIDO.join(', ')}].`);
  }

  if (erros.length > 0) {
    throw new RequisicaoInvalidaError('Dados de requisição inválidos.', erros);
  }

  // Retorna apenas os campos permitidos e sanitizados, ignorando campos extras
  return {
    cliente: dados.cliente.trim(),
    tipo: dados.tipo,
    valor: dados.valor,
    prioridade: dados.prioridade
  };
}

/**
 * Valida o payload de atualização de status de um pedido.
 * 
 * @param {Object} dados - Corpo da requisição com o campo 'status'.
 * @returns {{ status: string }} Objeto com o status validado.
 * @throws {RequisicaoInvalidaError} Se o corpo for inválido ou status fora dos valores aceitos.
 */
function validarAtualizacaoStatus(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados) || Object.keys(dados).length === 0) {
    throw new RequisicaoInvalidaError('O corpo da requisição não pode ser vazio.', [
      "Envie um objeto JSON contendo o campo 'status'."
    ]);
  }

  if (dados.status === undefined || dados.status === null) {
    throw new RequisicaoInvalidaError("O campo 'status' é obrigatório.", [
      'Informe o novo status desejado para o pedido.'
    ]);
  }

  if (typeof dados.status !== 'string') {
    throw new RequisicaoInvalidaError("O campo 'status' deve ser do tipo string.", [
      'O status deve ser uma string com um dos valores aceitos pelo sistema.'
    ]);
  }

  if (!STATUS_PEDIDO.includes(dados.status)) {
    throw new RequisicaoInvalidaError(`Status '${dados.status}' inválido.`, [
      `Valores permitidos para status: [${STATUS_PEDIDO.join(', ')}].`
    ]);
  }

  return { status: dados.status };
}

/**
 * Valida o identificador de pedido recebido na rota.
 * Trata IDs não numéricos, decimais ou menores que 1 com 404 (recurso não encontrado).
 * 
 * @param {string|number} idParam - Identificador informado na rota.
 * @returns {number} Identificador convertido em número inteiro positivo.
 * @throws {NaoEncontradoError} Se o identificador não for um inteiro >= 1.
 */
function validarId(idParam) {
  const formatoValido = typeof idParam === 'number'
    ? Number.isSafeInteger(idParam)
    : typeof idParam === 'string' && /^[0-9]+$/.test(idParam);
  const idNum = formatoValido ? Number(idParam) : NaN;

  if (!Number.isSafeInteger(idNum) || idNum < 1) {
    throw new NaoEncontradoError(
      `Pedido com ID '${idParam}' não encontrado.`,
      ['O identificador deve conter apenas dígitos e representar um número inteiro positivo seguro correspondente a um pedido existente.']
    );
  }
  return idNum;
}

module.exports = {
  validarCriacao,
  validarAtualizacaoStatus,
  validarId
};
