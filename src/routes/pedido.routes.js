/**
 * src/routes/pedido.routes.js
 * 
 * Responsabilidade:
 * Camada de roteamento do recurso 'pedidos'.
 * Mapeia os verbos HTTP e caminhos para os respectivos métodos do controller.
 */

const { Router } = require('express');
const pedidoController = require('../controllers/pedido.controller');

const router = Router();

// RF01: Cadastrar pedido
router.post('/', (req, res, next) => pedidoController.criar(req, res, next));

// RF02: Listar todos os pedidos
router.get('/', (req, res, next) => pedidoController.listar(req, res, next));

// RF03: Consultar pedido por ID
router.get('/:id', (req, res, next) => pedidoController.buscarPorId(req, res, next));

// RF04: Atualizar status do pedido
router.patch('/:id/status', (req, res, next) => pedidoController.atualizarStatus(req, res, next));

module.exports = router;

