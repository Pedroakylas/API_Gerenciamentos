/**
 * src/controllers/pedido.controller.js
 * 
 * Responsabilidade:
 * Camada de controle da PizzaFlow API.
 * Recebe a requisição HTTP (req), repassa os dados para o Service,
 * e responde (res) com o código de status HTTP correspondente.
 * Não contém regras de negócio.
 */

const pedidoService = require('../services/pedido.service');

class PedidoController {
  /**
   * POST /pedidos
   * Cadastra um novo pedido (RF01) e retorna 201 Created.
   */
  criar(req, res, next) {
    try {
      const pedidoCriado = pedidoService.criarPedido(req.body);
      return res.status(201).json(pedidoCriado);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /pedidos
   * Retorna a lista de pedidos cadastrados (RF02) com 200 OK.
   */
  listar(req, res, next) {
    try {
      const pedidos = pedidoService.listarPedidos(req.query);
      return res.status(200).json(pedidos);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /pedidos/:id
   * Consulta um pedido pelo ID (RF03) com 200 OK ou 404 se não existir.
   */
  buscarPorId(req, res, next) {
    try {
      const pedido = pedidoService.buscarPedidoPorId(req.params.id);
      return res.status(200).json(pedido);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PATCH /pedidos/:id/status
   * Atualiza o status de um pedido existente (RF04) com 200 OK.
   */
  atualizarStatus(req, res, next) {
    try {
      const pedidoAtualizado = pedidoService.atualizarStatus(req.params.id, req.body);
      return res.status(200).json(pedidoAtualizado);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new PedidoController();
