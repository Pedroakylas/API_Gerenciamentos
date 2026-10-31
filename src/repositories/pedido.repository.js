/**
 * src/repositories/pedido.repository.js
 * 
 * Responsabilidade:
 * Camada de acesso aos dados em memória da PizzaFlow API.
 * Encapsula uma coleção Map e gerencia IDs incrementais.
 * Não conhece regras de negócio.
 */

class PedidoRepository {
  constructor() {
    this.pedidos = new Map();
    this.proximoId = 1;
  }

  /**
   * Salva um novo pedido na memória com ID sequencial.
   * @param {Object} pedido - Objeto com os dados do pedido.
   * @returns {Object} Pedido persistido com ID gerado.
   */
  salvar(pedido) {
    const id = this.proximoId++;
    const registro = {
      id,
      ...pedido
    };
    this.pedidos.set(id, registro);
    return { ...registro };
  }

  /**
   * Retorna todos os pedidos cadastrados.
   * @returns {Object[]} Lista de pedidos em memória.
   */
  listarTodos() {
    return Array.from(this.pedidos.values()).map(pedido => ({ ...pedido }));
  }

  /**
   * Busca um pedido pelo identificador numérico.
   * @param {number} id - Identificador do pedido.
   * @returns {Object|null} Cópia do pedido ou null se não encontrado.
   */
  buscarPorId(id) {
    const idNum = Number(id);
    const pedido = this.pedidos.get(idNum);
    return pedido ? { ...pedido } : null;
  }

  /**
   * Atualiza os campos de um pedido existente.
   * @param {number} id - Identificador do pedido.
   * @param {Object} novosDados - Dados a serem mesclados.
   * @returns {Object|null} Pedido atualizado ou null se inexistente.
   */
  atualizar(id, novosDados) {
    const idNum = Number(id);
    const pedidoAtual = this.pedidos.get(idNum);
    if (!pedidoAtual) {
      return null;
    }

    const pedidoAtualizado = {
      ...pedidoAtual,
      ...novosDados,
      id: idNum // Garante imutabilidade do ID
    };

    this.pedidos.set(idNum, pedidoAtualizado);
    return { ...pedidoAtualizado };
  }

  /**
   * Limpa todos os dados e reseta o contador de ID.
   * Essencial para garantir isolamento absoluto entre os testes.
   */
  resetar() {
    this.pedidos.clear();
    this.proximoId = 1;
  }
}

// Exporta uma instância singleton para uso geral e a classe para testes
const pedidoRepository = new PedidoRepository();
module.exports = pedidoRepository;
module.exports.PedidoRepository = PedidoRepository;

