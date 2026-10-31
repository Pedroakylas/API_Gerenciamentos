const { PedidoRepository } = require('../src/repositories/pedido.repository');

describe('Camada de Repositório: PedidoRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new PedidoRepository();
  });

  test('deve salvar pedidos com IDs incrementais', () => {
    const primeiro = repository.salvar({ cliente: 'Pedro Akylas' });
    const segundo = repository.salvar({ cliente: 'Pedro Akylas' });

    expect(primeiro.id).toBe(1);
    expect(segundo.id).toBe(2);
  });

  test('deve devolver cópias para impedir alterações externas nos pedidos', () => {
    repository.salvar({ cliente: 'Pedro Akylas' });

    const encontrado = repository.buscarPorId(1);
    encontrado.cliente = 'Nome alterado';

    const listagem = repository.listarTodos();
    listagem[0].cliente = 'Outro nome';

    expect(repository.buscarPorId(1).cliente).toBe('Pedro Akylas');
  });

  test('deve atualizar os campos sem permitir alteração do ID', () => {
    repository.salvar({ cliente: 'Pedro Akylas', status: 'recebido' });

    const atualizado = repository.atualizar(1, {
      status: 'em_preparacao',
      id: 999
    });

    expect(atualizado).toEqual({
      id: 1,
      cliente: 'Pedro Akylas',
      status: 'em_preparacao'
    });
  });

  test('deve retornar null ao atualizar um pedido inexistente', () => {
    expect(repository.atualizar(999, { status: 'cancelado' })).toBeNull();
  });

  test('deve limpar pedidos e reiniciar a sequência de IDs', () => {
    repository.salvar({ cliente: 'Pedro Akylas' });

    repository.resetar();

    expect(repository.listarTodos()).toEqual([]);
    expect(repository.salvar({ cliente: 'Pedro Akylas' }).id).toBe(1);
  });
});
