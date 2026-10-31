/**
 * src/server.js
 * 
 * Responsabilidade:
 * Ponto de entrada de execução do servidor HTTP.
 * Responsável exclusivamente por iniciar o escutador de portas (app.listen).
 */

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[PizzaFlow API] Servidor em execução na porta ${PORT}`);
  console.log(`[PizzaFlow API] Documentação e endpoints disponíveis em http://localhost:${PORT}/pedidos`);
});

