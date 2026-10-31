/**
 * tests/pedido.service.test.js
 * 
 * Responsabilidade:
 * Testes unitários para a camada de regras de negócio (pedido.service.js).
 * Valida o ciclo de vida do pedido, regras de negócio e a máquina
 * de estados de transição.
 */

const pedidoService = require('../src/services/pedido.service');
const pedidoRepository = require('../src/repositories/pedido.repository');
const { RequisicaoInvalidaError, NaoEncontradoError } = require('../src/errors');

describe('Camada de Serviço: pedido.service', () => {
  beforeEach(() => {
    // Isolamento estrito: limpa dados e reseta IDs antes de cada teste
    pedidoRepository.resetar();
  });

  describe('RF01: cadastrar pedido', () => {
    test('deve criar um pedido com status inicial "recebido" e ID incremental', () => {
      const pedido1 = pedidoService.criarPedido({
        cliente: 'Pedro Akylas',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });

      expect(pedido1).toEqual({
        id: 1,
        cliente: 'Pedro Akylas',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal',
        status: 'recebido'
      });

      const pedido2 = pedidoService.criarPedido({
        cliente: 'Pedro Akylas',
        tipo: 'retirada',
        valor: 80,
        prioridade: 'alta'
      });

      expect(pedido2.id).toBe(2);
      expect(pedido2.status).toBe('recebido');
    });

    test('deve ignorar campos extras como id e status enviados no cadastro', () => {
      const pedido = pedidoService.criarPedido({
        cliente: 'Pedro Akylas',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal',
        id: 999,
        status: 'entregue',
        extra: 'dado_malicioso'
      });

      expect(pedido.id).toBe(1);
      expect(pedido.status).toBe('recebido');
      expect(pedido.extra).toBeUndefined();
    });
  });

  describe('RF02: listar pedidos', () => {
    test('deve retornar lista vazia quando não houver pedidos', () => {
      const pedidos = pedidoService.listarPedidos();
      expect(pedidos).toEqual([]);
    });

    test('deve retornar todos os pedidos cadastrados', () => {
      pedidoService.criarPedido({ cliente: 'Pedro Akylas', tipo: 'balcao', valor: 45, prioridade: 'baixa' });
      pedidoService.criarPedido({ cliente: 'Pedro Akylas', tipo: 'encomenda', valor: 120, prioridade: 'urgente' });

      const pedidos = pedidoService.listarPedidos();
      expect(pedidos).toHaveLength(2);
      expect(pedidos[0].cliente).toBe('Pedro Akylas');
      expect(pedidos[1].cliente).toBe('Pedro Akylas');
    });
  });

  describe('RF03: consultar pedido por ID', () => {
    test('deve retornar o pedido quando o ID existir', () => {
      const criado = pedidoService.criarPedido({
        cliente: 'Pedro Akylas',
        tipo: 'retirada',
        valor: 90,
        prioridade: 'normal'
      });

      const encontrado = pedidoService.buscarPedidoPorId(criado.id);
      expect(encontrado).toEqual(criado);
    });

    test('deve lançar NaoEncontradoError quando o ID for inexistente', () => {
      expect(() => pedidoService.buscarPedidoPorId(999)).toThrow(NaoEncontradoError);
    });

    test('deve lançar NaoEncontradoError quando o ID não for um número válido ou menor que 1', () => {
      expect(() => pedidoService.buscarPedidoPorId('invalido')).toThrow(NaoEncontradoError);
      expect(() => pedidoService.buscarPedidoPorId(-1)).toThrow(NaoEncontradoError);
    });
  });

  describe('RF04: atualizar status de pedido (Regras de Transição)', () => {
    test('Ordem 1: deve lançar 404 primeiro se o ID não existir, mesmo com status inválido', () => {
      expect(() => pedidoService.atualizarStatus(999, { status: 'status_inexistente' }))
        .toThrow(NaoEncontradoError);
    });

    test('Ordem 2: deve lançar 400 se o status for inválido após validar existência', () => {
      const pedido = pedidoService.criarPedido({
        cliente: 'Pedro Akylas',
        tipo: 'entrega',
        valor: 60,
        prioridade: 'normal'
      });

      expect(() => pedidoService.atualizarStatus(pedido.id, { status: 'invalido' }))
        .toThrow(RequisicaoInvalidaError);
    });

    test('deve rejeitar transição para o mesmo status atual', () => {
      const pedido = pedidoService.criarPedido({
        cliente: 'Pedro Akylas',
        tipo: 'entrega',
        valor: 60,
        prioridade: 'normal'
      });

      expect(() => pedidoService.atualizarStatus(pedido.id, { status: 'recebido' }))
        .toThrow(RequisicaoInvalidaError);
    });

    test('transições a partir de "recebido": permite "em_preparacao" e "cancelado", rejeita outros', () => {
      const p1 = pedidoService.criarPedido({ cliente: 'A', tipo: 'entrega', valor: 50, prioridade: 'normal' });
      const atualizado1 = pedidoService.atualizarStatus(p1.id, { status: 'em_preparacao' });
      expect(atualizado1.status).toBe('em_preparacao');

      const p2 = pedidoService.criarPedido({ cliente: 'B', tipo: 'entrega', valor: 50, prioridade: 'normal' });
      const atualizado2 = pedidoService.atualizarStatus(p2.id, { status: 'cancelado' });
      expect(atualizado2.status).toBe('cancelado');

      const p3 = pedidoService.criarPedido({ cliente: 'C', tipo: 'entrega', valor: 50, prioridade: 'normal' });
      expect(() => pedidoService.atualizarStatus(p3.id, { status: 'enviado' }))
        .toThrow(RequisicaoInvalidaError);
      expect(() => pedidoService.atualizarStatus(p3.id, { status: 'entregue' }))
        .toThrow(RequisicaoInvalidaError);
    });

    test('transições a partir de "em_preparacao" (entrega/encomenda): permite "enviado" e "cancelado", rejeita "entregue"', () => {
      const p = pedidoService.criarPedido({ cliente: 'D', tipo: 'entrega', valor: 50, prioridade: 'normal' });
      pedidoService.atualizarStatus(p.id, { status: 'em_preparacao' });

      // Rejeita pular "enviado" para entrega
      expect(() => pedidoService.atualizarStatus(p.id, { status: 'entregue' }))
        .toThrow(RequisicaoInvalidaError);

      // Permite enviado
      const atualizado = pedidoService.atualizarStatus(p.id, { status: 'enviado' });
      expect(atualizado.status).toBe('enviado');
    });

    test('exceção de negócio (retirada/balcao): de "em_preparacao" vai direto para "entregue" e não passa por "enviado"', () => {
      const pRetirada = pedidoService.criarPedido({ cliente: 'E', tipo: 'retirada', valor: 50, prioridade: 'normal' });
      pedidoService.atualizarStatus(pRetirada.id, { status: 'em_preparacao' });

      // Não passa por enviado
      expect(() => pedidoService.atualizarStatus(pRetirada.id, { status: 'enviado' }))
        .toThrow(RequisicaoInvalidaError);

      // Vai direto para entregue
      const atualizado = pedidoService.atualizarStatus(pRetirada.id, { status: 'entregue' });
      expect(atualizado.status).toBe('entregue');

      const pBalcao = pedidoService.criarPedido({ cliente: 'F', tipo: 'balcao', valor: 50, prioridade: 'normal' });
      pedidoService.atualizarStatus(pBalcao.id, { status: 'em_preparacao' });
      const atualizadoBalcao = pedidoService.atualizarStatus(pBalcao.id, { status: 'entregue' });
      expect(atualizadoBalcao.status).toBe('entregue');
    });

    test('pedido "enviado": permite "entregue", mas NÃO pode ser cancelado (já saiu da pizzaria)', () => {
      const p = pedidoService.criarPedido({ cliente: 'G', tipo: 'entrega', valor: 50, prioridade: 'normal' });
      pedidoService.atualizarStatus(p.id, { status: 'em_preparacao' });
      pedidoService.atualizarStatus(p.id, { status: 'enviado' });

      // Tentar cancelar após envio deve falhar
      expect(() => pedidoService.atualizarStatus(p.id, { status: 'cancelado' }))
        .toThrow(RequisicaoInvalidaError);

      // Entregar com sucesso
      const entregue = pedidoService.atualizarStatus(p.id, { status: 'entregue' });
      expect(entregue.status).toBe('entregue');
    });

    test('pedidos em estados finais ("entregue" ou "cancelado") não permitem novas transições', () => {
      const pEntregue = pedidoService.criarPedido({ cliente: 'H', tipo: 'balcao', valor: 50, prioridade: 'normal' });
      pedidoService.atualizarStatus(pEntregue.id, { status: 'em_preparacao' });
      pedidoService.atualizarStatus(pEntregue.id, { status: 'entregue' });

      expect(() => pedidoService.atualizarStatus(pEntregue.id, { status: 'cancelado' }))
        .toThrow(RequisicaoInvalidaError);

      const pCancelado = pedidoService.criarPedido({ cliente: 'I', tipo: 'entrega', valor: 50, prioridade: 'normal' });
      pedidoService.atualizarStatus(pCancelado.id, { status: 'cancelado' });

      expect(() => pedidoService.atualizarStatus(pCancelado.id, { status: 'em_preparacao' }))
        .toThrow(RequisicaoInvalidaError);
    });
  });
});

