/**
 * tests/pedido.routes.test.js
 * 
 * Responsabilidade:
 * Testes de integração HTTP de ponta a ponta com Supertest.
 * Valida todos os endpoints, status HTTP, contratos de payload e resposta,
 * tratamento de erros padronizados (400, 404, 500) e integridade da API.
 */

const request = require('supertest');
const app = require('../src/app');
const pedidoRepository = require('../src/repositories/pedido.repository');
const pedidoService = require('../src/services/pedido.service');

describe('Testes de Integração de Rotas: /pedidos', () => {
  beforeEach(() => {
    // Garante que o estado em memória e IDs sejam resetados para cada caso de teste
    pedidoRepository.resetar();
  });

  describe('POST /pedidos', () => {
    test('deve criar um pedido com sucesso (201) e retornar o formato exato', async () => {
      const payload = {
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      };

      const res = await request(app)
        .post('/pedidos')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: 1,
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal',
        status: 'recebido'
      });
    });

    test('deve ignorar campos extras enviados no body (ex: id e status)', async () => {
      const payload = {
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal',
        id: 999,
        status: 'cancelado',
        tentativaHack: true
      };

      const res = await request(app)
        .post('/pedidos')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: 1,
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal',
        status: 'recebido'
      });
    });

    test('deve retornar 400 se o cliente for vazio, só com espaços, ausente ou tipo inválido', async () => {
      const casos = [
        { tipo: 'entrega', valor: 100, prioridade: 'normal' }, // ausente
        { cliente: '', tipo: 'entrega', valor: 100, prioridade: 'normal' }, // vazio
        { cliente: '    ', tipo: 'entrega', valor: 100, prioridade: 'normal' }, // só espaços
        { cliente: 12345, tipo: 'entrega', valor: 100, prioridade: 'normal' } // tipo errado
      ];

      for (const caso of casos) {
        const res = await request(app).post('/pedidos').send(caso);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('erro');
        expect(res.body).toHaveProperty('detalhes');
        expect(Array.isArray(res.body.detalhes)).toBe(true);
      }
    });

    test('deve retornar 400 se o valor for zero, negativo, string, null ou NaN', async () => {
      const casos = [
        { cliente: 'Carlos', tipo: 'entrega', valor: 0, prioridade: 'normal' },
        { cliente: 'Carlos', tipo: 'entrega', valor: -15, prioridade: 'normal' },
        { cliente: 'Carlos', tipo: 'entrega', valor: '350', prioridade: 'normal' },
        { cliente: 'Carlos', tipo: 'entrega', valor: null, prioridade: 'normal' },
        { cliente: 'Carlos', tipo: 'entrega', valor: NaN, prioridade: 'normal' }
      ];

      for (const caso of casos) {
        const res = await request(app).post('/pedidos').send(caso);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('erro');
        expect(res.body.detalhes.length).toBeGreaterThan(0);
      }
    });

    test('deve retornar 400 se o tipo ou prioridade forem inválidos', async () => {
      const resTipo = await request(app).post('/pedidos').send({
        cliente: 'Carlos',
        tipo: 'motoboy', // inválido
        valor: 50,
        prioridade: 'normal'
      });
      expect(resTipo.status).toBe(400);

      const resPrioridade = await request(app).post('/pedidos').send({
        cliente: 'Carlos',
        tipo: 'entrega',
        valor: 50,
        prioridade: 'maxima' // inválido
      });
      expect(resPrioridade.status).toBe(400);
    });

    test('deve retornar 400 para JSON malformado', async () => {
      const res = await request(app)
        .post('/pedidos')
        .set('Content-Type', 'application/json')
        .send('{"cliente": "Carlos", "valor": 50, invalid_json}');

      expect(res.status).toBe(400);
      expect(res.body.erro).toBe('JSON malformado.');
      expect(res.body.detalhes[0]).toContain('sintaxe JSON inválida');
    });
  });

  describe('GET /pedidos', () => {
    test('deve retornar 200 com lista vazia quando não houver registros', async () => {
      const res = await request(app).get('/pedidos');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('deve retornar 200 com a lista de pedidos cadastrados', async () => {
      await request(app).post('/pedidos').send({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });
      await request(app).post('/pedidos').send({
        cliente: 'Rafaela Marques',
        tipo: 'retirada',
        valor: 120,
        prioridade: 'alta'
      });

      const res = await request(app).get('/pedidos');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].cliente).toBe('Carlos Silva');
      expect(res.body[1].cliente).toBe('Rafaela Marques');
    });
  });

  describe('GET /pedidos/:id', () => {
    test('deve retornar 200 com o pedido quando o ID existir', async () => {
      const criado = await request(app).post('/pedidos').send({
        cliente: 'Pedro Akylas',
        tipo: 'balcao',
        valor: 45,
        prioridade: 'urgente'
      });

      const res = await request(app).get(`/pedidos/${criado.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(criado.body);
    });

    test('deve retornar 404 quando o pedido não existir', async () => {
      const res = await request(app).get('/pedidos/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
      expect(res.body.erro).toContain('não encontrado');
      expect(res.body).toHaveProperty('detalhes');
    });

    test('deve retornar 404 com mensagem clara para IDs não numéricos ou menores que 1', async () => {
      const resNaoNumerico = await request(app).get('/pedidos/abc');
      expect(resNaoNumerico.status).toBe(404);
      expect(resNaoNumerico.body.detalhes[0]).toContain('número inteiro positivo');

      const resNegativo = await request(app).get('/pedidos/-5');
      expect(resNegativo.status).toBe(404);
    });
  });

  describe('PATCH /pedidos/:id/status', () => {
    test('deve atualizar o status com sucesso (200) em transição permitida', async () => {
      const postRes = await request(app).post('/pedidos').send({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });
      const id = postRes.body.id;

      const patchRes = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: 'em_preparacao' });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.status).toBe('em_preparacao');
    });

    test('Ordem 1: deve retornar 404 primeiro se o ID não existir, mesmo com status inválido', async () => {
      const res = await request(app)
        .patch('/pedidos/999/status')
        .send({ status: 'status_totalmente_invalido' });

      expect(res.status).toBe(404);
      expect(res.body.erro).toContain('não encontrado');
    });

    test('Ordem 2: deve retornar 400 se o status for inválido ou ausente em ID existente', async () => {
      const postRes = await request(app).post('/pedidos').send({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });
      const id = postRes.body.id;

      const resInvalido = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: 'finalizado_errado' });

      expect(resInvalido.status).toBe(400);
      expect(resInvalido.body.erro).toContain('inválido');

      const resVazio = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({});

      expect(resVazio.status).toBe(400);
    });

    test('Ordem 3: deve retornar 400 para transição proibida ou para o mesmo status', async () => {
      const postRes = await request(app).post('/pedidos').send({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });
      const id = postRes.body.id;

      // Mesmo status
      const resMesmo = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: 'recebido' });
      expect(resMesmo.status).toBe(400);
      expect(resMesmo.body.erro).toContain('já se encontra no status');

      // Pular direto para entregue em tipo entrega
      const resPulo = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: 'entregue' });
      expect(resPulo.status).toBe(400);
      expect(resPulo.body.erro).toContain('não é permitida');
    });

    test('exceção de negócio: retirada/balcao pode ir de em_preparacao direto para entregue', async () => {
      const postRes = await request(app).post('/pedidos').send({
        cliente: 'Lucas Retirada',
        tipo: 'retirada',
        valor: 90,
        prioridade: 'normal'
      });
      const id = postRes.body.id;

      // recebido -> em_preparacao
      await request(app).patch(`/pedidos/${id}/status`).send({ status: 'em_preparacao' });

      // Tentar enviado para retirada deve falhar
      const resEnviado = await request(app).patch(`/pedidos/${id}/status`).send({ status: 'enviado' });
      expect(resEnviado.status).toBe(400);

      // Ir direto para entregue deve ter sucesso
      const resEntregue = await request(app).patch(`/pedidos/${id}/status`).send({ status: 'entregue' });
      expect(resEntregue.status).toBe(200);
      expect(resEntregue.body.status).toBe('entregue');
    });

    test('pedido enviado não pode mais ser cancelado', async () => {
      const postRes = await request(app).post('/pedidos').send({
        cliente: 'Marcos Entrega',
        tipo: 'entrega',
        valor: 150,
        prioridade: 'urgente'
      });
      const id = postRes.body.id;

      await request(app).patch(`/pedidos/${id}/status`).send({ status: 'em_preparacao' });
      await request(app).patch(`/pedidos/${id}/status`).send({ status: 'enviado' });

      const resCancela = await request(app).patch(`/pedidos/${id}/status`).send({ status: 'cancelado' });
      expect(resCancela.status).toBe(400);
      expect(resCancela.body.erro).toContain('não é permitida');
    });
  });

  describe('Tratamento de Rotas Inexistentes e Erros Inesperados', () => {
    test('deve retornar 404 padronizado em JSON para rota inexistente', async () => {
      const res = await request(app).get('/rota-inexistente');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        erro: 'Rota GET /rota-inexistente não encontrada.',
        detalhes: ['Verifique o método HTTP utilizado e o caminho da URL informada.']
      });
    });

    test('deve retornar 500 padronizado sem vazar stack trace para erros inesperados', async () => {
      // Simula uma falha inesperada no service
      jest.spyOn(pedidoService, 'listarPedidos').mockImplementationOnce(() => {
        throw new Error('Falha grave inesperada');
      });

      const res = await request(app).get('/pedidos');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        erro: 'Erro interno do servidor.',
        detalhes: ['Ocorreu um erro inesperado ao processar a requisição. Tente novamente mais tarde.']
      });
      // Garante que a mensagem interna sensível e stack trace não foram expostos
      expect(JSON.stringify(res.body)).not.toContain('Falha grave inesperada');
      expect(JSON.stringify(res.body)).not.toContain('stack');
    });
  });
});

