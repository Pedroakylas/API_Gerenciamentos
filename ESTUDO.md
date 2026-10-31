# ESTUDO.md — PizzaFlow API
## Guia de Preparação para Avaliação Individual

**Disciplina:** Tópicos Avançados em Sistemas de Informação II  
**Integrantes:** Pedro Akylas (45543232) · Rafaela Marques (46321365)

---

## 1. Fluxo Completo de uma Requisição POST /pedidos

```
Cliente HTTP (Postman / curl)
        │
        ▼
  [Express — app.js]
  express.json() → faz parse do body JSON
        │
        ▼
  [pedido.routes.js]
  POST '/' → pedidoController.criar(req, res, next)
        │
        ▼
  [pedido.controller.js — criar()]
  Recebe req.body, chama pedidoService.criarPedido(req.body)
  Não toca em regras de negócio. Aguarda retorno.
        │
        ▼
  [pedido.service.js — criarPedido()]
  1. Chama pedidoValidator.validarCriacao(dados)
     → Valida e sanitiza cliente (trim), tipo, valor, prioridade
     → Ignora campos extras (id, status, etc.)
     → Lança RequisicaoInvalidaError (400) se inválido
  2. Aplica regra de negócio: status = 'recebido'
  3. Chama pedidoRepository.salvar(novoPedido)
        │
        ▼
  [pedido.repository.js — salvar()]
  Gera ID incremental (proximoId++)
  Salva no Map em memória
  Retorna cópia do objeto persistido
        │
        ▼
  [pedido.controller.js — criar()] ← retorno sobe
  res.status(201).json(pedidoCriado)
        │
        ▼
  Cliente recebe: 201 Created + corpo JSON
```

---

## 2. Fluxo Completo de uma Requisição PATCH /pedidos/:id/status

```
Cliente HTTP
        │
        ▼
  [Express — app.js]
  express.json() → parse do body
        │
        ▼
  [pedido.routes.js]
  PATCH '/:id/status' → pedidoController.atualizarStatus(req, res, next)
        │
        ▼
  [pedido.controller.js — atualizarStatus()]
  Extrai req.params.id e req.body
  Chama pedidoService.atualizarStatus(id, body)
        │
        ▼
  [pedido.service.js — atualizarStatus()]
  PASSO 1 — Verifica existência:
    → pedidoValidator.validarId(idParam)
       (lança NaoEncontradoError 404 para ID inválido)
    → pedidoRepository.buscarPorId(id)
       (lança NaoEncontradoError 404 se não encontrado)

  PASSO 2 — Valida o novo status:
    → pedidoValidator.validarAtualizacaoStatus(corpo)
       (lança RequisicaoInvalidaError 400 se ausente, inválido ou fora da lista)

  PASSO 3 — Verifica transição:
    → Compara status atual === novo status → 400 (mesmo status)
    → obterTransicoesPermitidas(statusAtual, tipo)
    → Se novo status não está na lista → 400 (transição proibida)
    → Se lista vazia (estado final) → 400 (estado terminal)

  PASSO 4 — Persiste:
    → pedidoRepository.atualizar(id, { status: novoStatus })
        │
        ▼
  [pedido.controller.js] ← retorno sobe
  res.status(200).json(pedidoAtualizado)
        │
        ▼
  Cliente recebe: 200 OK + pedido com status atualizado

  Em caso de erro em qualquer passo:
  → next(err) no controller
  → [erro.middleware.js] interpreta err.statusCode
     e responde { erro, detalhes } com o código correto
```

---

## 3. Dez Perguntas Prováveis do Professor

### P1. Por que o controller não deve conter regras de negócio?
**R:** Porque o controller é responsável apenas pela interface HTTP — ler `req` e escrever `res`. Colocar regras de negócio ali viola o princípio de responsabilidade única (SRP) e dificulta testar as regras de forma isolada (sem HTTP). Se a regra mudar, o controller não precisa ser tocado.

### P2. O que é e para que serve o método `resetar()` no repositório?
**R:** Limpa o `Map` em memória e reinicia o contador de ID para 1. É essencial nos testes: como o repositório é um singleton compartilhado entre todos os testes, sem o `resetar()` no `beforeEach` um teste interferiria no estado dos seguintes (IDs errados, lista suja). Só existe para facilitar o isolamento nos testes — código de produção não chama esse método.

### P3. Por que IDs inválidos (ex: "abc", "-1", "1.5") retornam 404 e não 400?
**R:** Decisão de projeto documentada: a API expõe IDs apenas como parte da URL do recurso (`/pedidos/:id`). Do ponto de vista do cliente, um ID "abc" simplesmente não corresponde a nenhum recurso — é como perguntar "me dê o pedido número abc", que não existe. Retornar 404 é semanticamente correto: o recurso não foi encontrado. Retornar 400 implicaria que o cliente cometeu um erro no formato da requisição, o que pode ser enganoso.

### P4. O que acontece se o cliente enviar `"valor": "350"` (string em vez de número)?
**R:** O validator rejeita com 400. A verificação é `typeof dados.valor !== 'number'` — uma string numérica passa o `Number()` mas falha no `typeof`. O enunciado exige explicitamente rejeitar strings, mesmo que representem números válidos.

### P5. Por que a função `obterTransicoesPermitidas` fica em `config/dominio.js` e não no service?
**R:** Porque ela representa uma regra de domínio pura — a máquina de estados — sem nenhuma dependência de infraestrutura ou framework. Ao colocá-la em `dominio.js`, ela pode ser reutilizada em outros serviços, testada de forma isolada e consultada facilmente para documentação. É uma separação de concerns: domínio vs. orquestração.

### P6. Como o middleware `erroMiddleware` distingue um erro 400 de um erro 500?
**R:** Pelo campo `err.statusCode`. Os erros customizados (`RequisicaoInvalidaError` e `NaoEncontradoError`) definem `this.statusCode` em seus construtores. O middleware verifica `if (err.statusCode && typeof err.statusCode === 'number')` — se presente, usa esse código; caso contrário, é um erro inesperado e retorna 500 com mensagem genérica.

### P7. Por que o `erroMiddleware` tem 4 parâmetros `(err, req, res, next)`?
**R:** É uma convenção do Express: middlewares de tratamento de erro precisam ter exatamente 4 parâmetros para que o Express os reconheça como tratadores de erro e não como middlewares comuns. Se a assinatura tivesse 3 parâmetros, o Express o trataria como middleware normal e não o chamaria quando `next(err)` fosse invocado com um erro.

### P8. Por que o repositório exporta tanto uma instância (`pedidoRepository`) quanto a classe (`PedidoRepository`)?
**R:** Para suportar dois casos de uso: a aplicação usa o singleton (instância única compartilhada), garantindo consistência dos dados em memória. Os testes, ao querer isolar completamente, podem usar o `resetar()` do singleton. A classe exportada permite também injeção de dependência: o `PedidoService` aceita um repositório como argumento no construtor, facilitando testes unitários puros com repositório fake.

### P9. O que acontece se o cliente enviar um body completamente vazio no PATCH?
**R:** O `express.json()` parseia `{}` como objeto vazio. O validator `validarAtualizacaoStatus({})` detecta que o objeto está vazio (`Object.keys(dados).length === 0`) e lança `RequisicaoInvalidaError` com 400. O middleware de erro captura e responde `{ erro: '...', detalhes: [...] }`.

### P10. Qual a diferença entre `buscarPorId` no repository e no service?
**R:** O repository é técnico: recebe um número, busca no Map e retorna `null` se não encontrar. O service é semântico: valida o formato do ID com o validator (pode lançar 404), chama o repository, e se o retorno for `null` lança `NaoEncontradoError` com mensagem de negócio. O service sabe o que significa "não encontrar um pedido"; o repository apenas sabe como acessar o dado.

---

## 4. Cinco Exercícios de Pequena Correção

### Exercício 1 — Adicionar um novo tipo de pedido: `"drive_thru"`

**Onde mexer:**
1. `src/config/dominio.js` → adicionar `'drive_thru'` ao array `TIPOS_PEDIDO`.
2. `src/validators/pedido.validator.js` → nenhuma mudança necessária (já usa `TIPOS_PEDIDO`).
3. `README.md` → atualizar a lista de valores aceitos para `tipo`.
4. `tests/pedido.validator.test.js` → adicionar um teste verificando que `'drive_thru'` é aceito.

**Por que só `dominio.js`?** Porque todas as validações usam a constante `TIPOS_PEDIDO` — centralizado em um único lugar.

---

### Exercício 2 — Mudar regra de transição: "recebido" NÃO pode mais ir para "cancelado"

**Onde mexer:**
1. `src/config/dominio.js` → na função `obterTransicoesPermitidas`, alterar o `case 'recebido'`:
   ```js
   case 'recebido':
     return ['em_preparacao']; // remover 'cancelado'
   ```
2. `tests/pedido.service.test.js` → o teste que verifica `recebido → cancelado` como válido deve ser alterado para esperar erro 400.
3. `README.md` → atualizar a tabela de transições de status.

---

### Exercício 3 — Adicionar validação de tamanho máximo do campo `cliente` (máx. 100 caracteres)

**Onde mexer:**
1. `src/validators/pedido.validator.js` → na seção de validação do `cliente`, após o `trim()`, adicionar:
   ```js
   else if (dados.cliente.trim().length > 100) {
     erros.push("O campo 'cliente' não pode ter mais de 100 caracteres.");
   }
   ```
2. `tests/pedido.validator.test.js` → adicionar teste com string de 101 caracteres esperando 400.
3. `README.md` → documentar a nova regra de validação.

---

### Exercício 4 — Adicionar campo `observacao` opcional ao pedido

**Onde mexer:**
1. `src/validators/pedido.validator.js` → em `validarCriacao()`, verificar se `observacao` está presente e é string; se inválido, adicionar erro; se ausente, ignorar. Retornar o campo no objeto sanitizado.
2. `src/services/pedido.service.js` → incluir `observacao: dadosValidados.observacao || null` no `novoPedido`.
3. `tests/pedido.validator.test.js` → testar criação com e sem o campo `observacao`.
4. `README.md` → documentar o novo campo opcional.

---

### Exercício 5 — Adicionar rota GET /pedidos?status=recebido (filtrar por status)

**Onde mexer:**
1. `src/repositories/pedido.repository.js` → adicionar método `listarPorStatus(status)` que filtra o Map.
2. `src/services/pedido.service.js` → alterar `listarPedidos()` para aceitar parâmetro `{ status }` e chamar o método de filtro se informado.
3. `src/controllers/pedido.controller.js` → extrair `req.query.status` e passar ao service.
4. `src/validators/pedido.validator.js` → validar que o status informado na query é válido.
5. `tests/pedido.routes.test.js` → testar `GET /pedidos?status=recebido` com pedidos de status diferentes.

