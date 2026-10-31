/**
 * src/config/dominio.js
 * 
 * Responsabilidade:
 * Centralizar as constantes de domínio, valores permitidos e regras
 * de transição de status para a PizzaFlow API.
 */

const TIPOS_PEDIDO = Object.freeze([
  'entrega',
  'retirada',
  'balcao',
  'encomenda'
]);

const PRIORIDADES_PEDIDO = Object.freeze([
  'baixa',
  'normal',
  'alta',
  'urgente'
]);

const STATUS_PEDIDO = Object.freeze([
  'recebido',
  'em_preparacao',
  'enviado',
  'entregue',
  'cancelado'
]);

const STATUS_INICIAL = 'recebido';

/**
 * Retorna os próximos status permitidos com base no status atual e no tipo do pedido.
 * 
 * Regras:
 * - recebido -> em_preparacao, cancelado
 * - em_preparacao -> enviado, cancelado (regra geral)
 * - Exceção de negócio: pedidos 'retirada' ou 'balcao' não passam por 'enviado',
 *   indo direto de em_preparacao para 'entregue' (ou 'cancelado').
 * - enviado -> entregue (pedido enviado já saiu e não pode ser cancelado).
 * - entregue -> nenhum (estado final).
 * - cancelado -> nenhum (estado final).
 * 
 * @param {string} statusAtual - Status em que o pedido se encontra.
 * @param {string} tipo - Tipo do pedido ('entrega', 'retirada', 'balcao', 'encomenda').
 * @returns {string[]} Lista de próximos status válidos.
 */
function obterTransicoesPermitidas(statusAtual, tipo) {
  switch (statusAtual) {
    case 'recebido':
      return ['em_preparacao', 'cancelado'];

    case 'em_preparacao':
      if (tipo === 'retirada' || tipo === 'balcao') {
        return ['entregue', 'cancelado'];
      }
      return ['enviado', 'cancelado'];

    case 'enviado':
      return ['entregue'];

    case 'entregue':
    case 'cancelado':
      return [];

    default:
      return [];
  }
}

module.exports = {
  TIPOS_PEDIDO,
  PRIORIDADES_PEDIDO,
  STATUS_PEDIDO,
  STATUS_INICIAL,
  obterTransicoesPermitidas
};

