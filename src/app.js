/**
 * src/app.js
 * 
 * Responsabilidade:
 * Configuração central da aplicação Express, middlewares globais,
 * montagem de rotas, tratamento de rota 404 e tratador de erros.
 * Exporta a instância configurada do Express (sem iniciar o listen).
 */

const express = require('express');
const pedidoRoutes = require('./routes/pedido.routes');
const naoEncontradoMiddleware = require('./middlewares/nao-encontrado.middleware');
const erroMiddleware = require('./middlewares/erro.middleware');

const app = express();

// Middleware para parsing de requisições com corpo JSON
app.use(express.json());

// Montagem das rotas obrigatórias do recurso /pedidos
app.use('/pedidos', pedidoRoutes);

// Middleware para capturar requisições a rotas não existentes (404)
app.use(naoEncontradoMiddleware);

// Middleware global para captura e padronização de erros (400, 404, 500)
app.use(erroMiddleware);

module.exports = app;

