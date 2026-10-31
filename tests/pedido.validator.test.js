/**
 * tests/pedido.validator.test.js
 * 
 * Responsabilidade:
 * Testes unitários para a camada de validação (pedido.validator.js).
 * Cobre todos os cenários de erro e sucesso para criação, atualização de status e validação de ID.
 */

const { validarCriacao, validarAtualizacaoStatus, validarId } = require('../src/validators/pedido.validator');
const { RequisicaoInvalidaError, NaoEncontradoError } = require('../src/errors');

describe('Camada de Validação: pedido.validator', () => {
  describe('validarCriacao()', () => {
    test('deve aceitar um payload válido e aplicar trim no cliente', () => {
      const entrada = {
        cliente: '  Pedro Akylas  ',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      };

      const resultado = validarCriacao(entrada);

      expect(resultado).toEqual({
        cliente: 'Pedro Akylas',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });
    });

    test('deve ignorar campos extras enviados no payload', () => {
      const entrada = {
        cliente: 'Pedro Akylas',
        tipo: 'retirada',
        valor: 75.5,
        prioridade: 'alta',
        id: 999,
        status: 'entregue',
        isAdmin: true
      };

      const resultado = validarCriacao(entrada);

      expect(resultado).toEqual({
        cliente: 'Pedro Akylas',
        tipo: 'retirada',
        valor: 75.5,
        prioridade: 'alta'
      });
      expect(resultado.id).toBeUndefined();
      expect(resultado.status).toBeUndefined();
      expect(resultado.isAdmin).toBeUndefined();
    });

    test('deve rejeitar corpo ausente, nulo ou vazio', () => {
      expect(() => validarCriacao(null)).toThrow(RequisicaoInvalidaError);
      expect(() => validarCriacao(undefined)).toThrow(RequisicaoInvalidaError);
      expect(() => validarCriacao({})).toThrow(RequisicaoInvalidaError);
      expect(() => validarCriacao([])).toThrow(RequisicaoInvalidaError);
    });

    test('deve rejeitar cliente ausente, com tipo não-string, vazio ou apenas com espaços', () => {
      const payloadBase = { tipo: 'entrega', valor: 50, prioridade: 'normal' };

      // Cliente ausente
      expect(() => validarCriacao({ ...payloadBase })).toThrow(RequisicaoInvalidaError);
      // Cliente nulo
      expect(() => validarCriacao({ ...payloadBase, cliente: null })).toThrow(RequisicaoInvalidaError);
      // Cliente número
      expect(() => validarCriacao({ ...payloadBase, cliente: 12345 })).toThrow(RequisicaoInvalidaError);
      // Cliente string vazia
      expect(() => validarCriacao({ ...payloadBase, cliente: '' })).toThrow(RequisicaoInvalidaError);
      // Cliente apenas espaços em branco
      expect(() => validarCriacao({ ...payloadBase, cliente: '     ' })).toThrow(RequisicaoInvalidaError);
    });

    test('deve rejeitar valor ausente, string, nulo, NaN, Infinity, booleano, zero ou negativo', () => {
      const payloadBase = { cliente: 'Lucas', tipo: 'balcao', prioridade: 'baixa' };

      // Valor ausente
      expect(() => validarCriacao({ ...payloadBase })).toThrow(RequisicaoInvalidaError);
      // Valor string numérica
      expect(() => validarCriacao({ ...payloadBase, valor: '350' })).toThrow(RequisicaoInvalidaError);
      // Valor nulo
      expect(() => validarCriacao({ ...payloadBase, valor: null })).toThrow(RequisicaoInvalidaError);
      // Valor NaN
      expect(() => validarCriacao({ ...payloadBase, valor: NaN })).toThrow(RequisicaoInvalidaError);
      // Valor Infinity
      expect(() => validarCriacao({ ...payloadBase, valor: Infinity })).toThrow(RequisicaoInvalidaError);
      // Valor booleano
      expect(() => validarCriacao({ ...payloadBase, valor: true })).toThrow(RequisicaoInvalidaError);
      // Valor zero
      expect(() => validarCriacao({ ...payloadBase, valor: 0 })).toThrow(RequisicaoInvalidaError);
      // Valor negativo
      expect(() => validarCriacao({ ...payloadBase, valor: -10 })).toThrow(RequisicaoInvalidaError);
    });

    test('deve rejeitar tipos inválidos ou com grafia maiúscula (case-sensitive)', () => {
      const payloadBase = { cliente: 'Lucas', valor: 50, prioridade: 'baixa' };

      expect(() => validarCriacao({ ...payloadBase, tipo: 'outro' })).toThrow(RequisicaoInvalidaError);
      expect(() => validarCriacao({ ...payloadBase, tipo: 'ENTREGA' })).toThrow(RequisicaoInvalidaError);
      expect(() => validarCriacao({ ...payloadBase, tipo: 123 })).toThrow(RequisicaoInvalidaError);
    });

    test('deve rejeitar prioridades inválidas ou com grafia maiúscula (case-sensitive)', () => {
      const payloadBase = { cliente: 'Lucas', tipo: 'entrega', valor: 50 };

      expect(() => validarCriacao({ ...payloadBase, prioridade: 'maxima' })).toThrow(RequisicaoInvalidaError);
      expect(() => validarCriacao({ ...payloadBase, prioridade: 'ALTA' })).toThrow(RequisicaoInvalidaError);
      expect(() => validarCriacao({ ...payloadBase, prioridade: null })).toThrow(RequisicaoInvalidaError);
    });

    test('deve acumular múltiplos erros no array detalhes', () => {
      try {
        validarCriacao({
          cliente: '',
          tipo: 'invalido',
          valor: -5,
          prioridade: 'invalida'
        });
        throw new Error('Deveria ter falhado');
      } catch (err) {
        expect(err).toBeInstanceOf(RequisicaoInvalidaError);
        expect(err.detalhes.length).toBe(4);
      }
    });
  });

  describe('validarAtualizacaoStatus()', () => {
    test('deve aceitar status válidos', () => {
      expect(validarAtualizacaoStatus({ status: 'em_preparacao' })).toEqual({ status: 'em_preparacao' });
      expect(validarAtualizacaoStatus({ status: 'cancelado' })).toEqual({ status: 'cancelado' });
    });

    test('deve rejeitar corpo ausente ou vazio', () => {
      expect(() => validarAtualizacaoStatus(null)).toThrow(RequisicaoInvalidaError);
      expect(() => validarAtualizacaoStatus({})).toThrow(RequisicaoInvalidaError);
    });

    test('deve rejeitar status ausente, não-string ou fora da lista de status permitidos', () => {
      expect(() => validarAtualizacaoStatus({ status: null })).toThrow(RequisicaoInvalidaError);
      expect(() => validarAtualizacaoStatus({ status: 123 })).toThrow(RequisicaoInvalidaError);
      expect(() => validarAtualizacaoStatus({ status: 'pronto' })).toThrow(RequisicaoInvalidaError);
      expect(() => validarAtualizacaoStatus({ status: 'FINALIZADO' })).toThrow(RequisicaoInvalidaError);
    });
  });

  describe('validarId()', () => {
    test('deve converter e retornar número inteiro positivo', () => {
      expect(validarId(1)).toBe(1);
      expect(validarId('42')).toBe(42);
      expect(validarId('00042')).toBe(42);
    });

    test('deve lançar NaoEncontradoError (404) para IDs não numéricos, decimais ou menores que 1', () => {
      expect(() => validarId('abc')).toThrow(NaoEncontradoError);
      expect(() => validarId('1.5')).toThrow(NaoEncontradoError);
      expect(() => validarId(0)).toThrow(NaoEncontradoError);
      expect(() => validarId('-5')).toThrow(NaoEncontradoError);
      expect(() => validarId('1e2')).toThrow(NaoEncontradoError);
      expect(() => validarId('0x1')).toThrow(NaoEncontradoError);
      expect(() => validarId('9007199254740992')).toThrow(NaoEncontradoError);
      expect(() => validarId(true)).toThrow(NaoEncontradoError);
      expect(() => validarId(NaN)).toThrow(NaoEncontradoError);
    });
  });
});
