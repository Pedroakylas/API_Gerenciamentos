/**
 * src/services/pedido.service.js
 * 
 * Responsabilidade:
 * Camada de regras de negócio da PizzaFlow API.
 * Gerencia a criação com status inicial, verificação de existência,
 * validação estrita da máquina de estados de transição e coordenação
 * com o repositório. Não conhece req/res.
 */

const pedidoRepository = require('../repositories/pedido.repository');
const pedidoValidator = require('../validators/pedido.validator');
const { STATUS_INICIAL, obterTransicoesPermitidas } = require('../config/dominio');
const { RequisicaoInvalidaError, NaoEncontradoError } = require('../errors');

class PedidoService {
  /**
   * Permite injeção de dependência do repositório para facilidade em testes.
   * @param {Object} [repository=pedidoRepository] - Repositório de dados.
   */
  constructor(repository = pedidoRepository) {
    this.repository = repository;
  }

  /**
   * RF01: Cadastra um novo pedido com status inicial 'recebido'.
   * 
   * @param {Object} dados - Dados recebidos para criação do pedido.
   * @returns {Object} Pedido persistido com ID e status 'recebido'.
   */
  criarPedido(dados) {
    // 1. Sanitiza e valida os dados de entrada
    const dadosValidados = pedidoValidator.validarCriacao(dados);

    // 2. Aplica a regra de negócio: todo pedido novo nasce com status 'recebido'
    const novoPedido = {
      cliente: dadosValidados.cliente,
      tipo: dadosValidados.tipo,
      valor: dadosValidados.valor,
      prioridade: dadosValidados.prioridade,
      status: STATUS_INICIAL
    };

    // 3. Salva no repositório em memória
    return this.repository.salvar(novoPedido);
  }

  /**
   * RF02: Lista todos os pedidos cadastrados.
   * 
   * @returns {Object[]} Lista com todos os pedidos.
   */
  listarPedidos() {
    return this.repository.listarTodos();
  }

  /**
   * RF03: Consulta um pedido pelo identificador.
   * 
   * @param {string|number} idParam - Identificador informado.
   * @returns {Object} Pedido encontrado.
   * @throws {NaoEncontradoError} Se o ID for inválido ou o pedido não existir.
   */
  buscarPedidoPorId(idParam) {
    const id = pedidoValidator.validarId(idParam);
    const pedido = this.repository.buscarPorId(id);

    if (!pedido) {
      throw new NaoEncontradoError(
        `Pedido com ID '${idParam}' não encontrado.`,
        ['Nenhum pedido foi localizado com o identificador fornecido.']
      );
    }

    return pedido;
  }

  /**
   * RF04: Atualiza o status de um pedido respeitando a ordem estrita:
   * (1) pedido existe? 404
   * (2) body e status válidos? 400
   * (3) transição permitida? 400
   * 
   * @param {string|number} idParam - Identificador do pedido.
   * @param {Object} corpo - Objeto contendo o novo status.
   * @returns {Object} Pedido com o status devidamente atualizado.
   */
  atualizarStatus(idParam, corpo) {
    // (1) Pedido existe? Retorna 404 se inexistente ou ID inválido
    const pedido = this.buscarPedidoPorId(idParam);

    // (2) Body e status válidos? Retorna 400 se formato ou valor do status for inválido
    const { status: novoStatus } = pedidoValidator.validarAtualizacaoStatus(corpo);

    // (3) Transição permitida? Retorna 400 se a transição for proibida
    // 3.1: Transição para o mesmo status atual é inválida
    if (pedido.status === novoStatus) {
      throw new RequisicaoInvalidaError(
        `Transição inválida: o pedido já se encontra no status '${pedido.status}'.`,
        ['O novo status informado deve ser diferente do status atual do pedido.']
      );
    }

    // 3.2: Consulta destinos válidos para o status e tipo do pedido
    const destinosPermitidos = obterTransicoesPermitidas(pedido.status, pedido.tipo);

    if (!destinosPermitidos.includes(novoStatus)) {
      if (destinosPermitidos.length === 0) {
        throw new RequisicaoInvalidaError(
          `Transição não permitida: o pedido está no status final '${pedido.status}'.`,
          [`O status '${pedido.status}' é um estado terminal e não aceita novas alterações.`]
        );
      }

      throw new RequisicaoInvalidaError(
        `Transição de '${pedido.status}' para '${novoStatus}' não é permitida para pedidos do tipo '${pedido.tipo}'.`,
        [`Destinos permitidos a partir de '${pedido.status}': [${destinosPermitidos.join(', ')}].`]
      );
    }

    // 4. Executa a persistência da atualização de status
    return this.repository.atualizar(pedido.id, { status: novoStatus });
  }
}

// Exporta a instância padrão e a classe para testes
const pedidoService = new PedidoService();
module.exports = pedidoService;
module.exports.PedidoService = PedidoService;

