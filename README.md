# PizzaFlow API

> API REST para gerenciamento de pedidos de uma pizzaria de bairro — projeto avaliativo da disciplina **Tópicos Avançados em Sistemas de Informação II**.

---

## Integrantes

| Nome | RGM |
|---|---|
| Pedro Akylas | 45543232 |
| Rafaela Marques | 46321365 |

---

## Tecnologias

| Tecnologia | Versão | Papel |
|---|---|---|
| Node.js | ≥ 18 | Runtime JavaScript |
| Express | ^4.21 | Framework HTTP |
| Jest | ^29 | Framework de testes |
| Supertest | ^7 | Testes de integração HTTP |

- **Armazenamento:** memória (`Map` em `pedido.repository.js`), sem banco de dados.
- **Módulos:** CommonJS (`require/module.exports`).
- **Sem variáveis de ambiente, senhas ou tokens.**

---

## Instalação e Execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor (porta 3000)
npm start

# 3. Rodar todos os testes
npm test
```

> O servidor fica disponível em `http://localhost:3000`.

---

## Arquitetura em Camadas

```
pizzaflow-api/
├── src/
│   ├── server.js                        → Ponto de entrada: app.listen()
│   ├── app.js                           → Express, middlewares, rotas, 404 e erro global
│   ├── config/
│   │   └── dominio.js                   → Constantes e máquina de estados
│   ├── routes/
│   │   └── pedido.routes.js             → Mapeia método + rota → controller
│   ├── controllers/
│   │   └── pedido.controller.js         → Lê req, chama service, escreve res
│   ├── services/
│   │   └── pedido.service.js            → Regras de negócio e transições de status
│   ├── validators/
│   │   └── pedido.validator.js          → Validação e sanitização de dados de entrada
│   ├── repositories/
│   │   └── pedido.repository.js         → Acesso aos dados em memória (Map)
│   ├── errors/
│   │   ├── index.js                     → Exportação centralizada dos erros
│   │   ├── requisicao-invalida.error.js → Erro 400
│   │   └── nao-encontrado.error.js      → Erro 404
│   └── middlewares/
│       ├── nao-encontrado.middleware.js → Rota inexistente → 404
│       └── erro.middleware.js           → Tratador global de erros
├── tests/
│   ├── pedido.validator.test.js         → Testes unitários do validator
│   ├── pedido.service.test.js           → Testes unitários do service
│   ├── pedido.repository.test.js        → Testes unitários do repository
│   └── pedido.routes.test.js            → Testes de integração com Supertest
├── evidencias/
│   ├── pizzaflow-api.postman_collection.json
│   ├── README.md                        → Passo a passo dos prints
│   ├── 01-criacao.png
│   ├── 02-validacao.png
│   ├── 03-listagem.png
│   ├── 04-consulta-inexistente.png
│   └── 05-atualizacao.png
├── ESTUDO.md
├── package.json
└── .gitignore
```

### Responsabilidades e Justificativas

| Camada | Arquivo | Responsabilidade | Por que separar? |
|---|---|---|---|
| **Config** | `dominio.js` | Define os valores aceitos e as regras de transição de status | Mudanças de domínio ficam em um único lugar, sem alterar código de execução |
| **Routes** | `pedido.routes.js` | Mapeia verbos HTTP e caminhos para o controller | Mantém o Express isolado das regras de negócio |
| **Controller** | `pedido.controller.js` | Interface HTTP: lê `req`, chama o service, responde com `res` | Não deve conter regras de negócio (SRP) |
| **Service** | `pedido.service.js` | Orquestra as regras de negócio, validações e persistência | Testável sem HTTP, reutilizável por outros meios de entrada |
| **Validator** | `pedido.validator.js` | Valida e sanitiza dados de entrada | Separado do service para testar validações de forma unitária |
| **Repository** | `pedido.repository.js` | Acesso e persistência dos dados em memória | Isolado para facilitar troca futura por banco de dados |
| **Errors** | `errors/` | Classes de erro com statusCode embutido | Permite o middleware de erro agir de forma genérica |
| **Middlewares** | `middlewares/` | Captura de rotas inválidas (404) e tratamento global de erros | Centraliza o tratamento, evitando repetição em todo controller |

---

## Endpoints

### POST /pedidos — Cadastrar pedido

**Requisição:**
```http
POST /pedidos HTTP/1.1
Content-Type: application/json

{
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal"
}
```

**Resposta de sucesso (201 Created):**
```json
{
  "id": 1,
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal",
  "status": "recebido"
}
```

**Resposta de erro (400 Bad Request):**
```json
{
  "erro": "Dados de requisição inválidos.",
  "detalhes": [
    "O campo 'cliente' não pode ser vazio ou conter apenas espaços.",
    "O campo 'tipo' é inválido. Valores permitidos: [entrega, retirada, balcao, encomenda]."
  ]
}
```

---

### GET /pedidos — Listar todos os pedidos

**Requisição:**
```http
GET /pedidos HTTP/1.1
```

**Resposta de sucesso (200 OK):**
```json
[
  {
    "id": 1,
    "cliente": "Carlos Silva",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "normal",
    "status": "recebido"
  }
]
```
> Retorna array vazio `[]` se não houver pedidos.

---

### GET /pedidos/:id — Consultar pedido por ID

**Requisição:**
```http
GET /pedidos/1 HTTP/1.1
```

**Resposta de sucesso (200 OK):**
```json
{
  "id": 1,
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal",
  "status": "recebido"
}
```

**Resposta de erro (404 Not Found):**
```json
{
  "erro": "Pedido com ID '999' não encontrado.",
  "detalhes": [
    "Nenhum pedido foi localizado com o identificador fornecido."
  ]
}
```

---

### PATCH /pedidos/:id/status — Atualizar status

**Requisição:**
```http
PATCH /pedidos/1/status HTTP/1.1
Content-Type: application/json

{
  "status": "em_preparacao"
}
```

**Resposta de sucesso (200 OK):**
```json
{
  "id": 1,
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal",
  "status": "em_preparacao"
}
```

**Resposta de erro — transição inválida (400 Bad Request):**
```json
{
  "erro": "Transição de 'recebido' para 'entregue' não é permitida para pedidos do tipo 'entrega'.",
  "detalhes": [
    "Destinos permitidos a partir de 'recebido': [em_preparacao, cancelado]."
  ]
}
```

---

## Valores Aceitos e Regras de Validação

### Tipos de pedido (`tipo`)

| Valor | Descrição |
|---|---|
| `entrega` | Pedido com entrega no endereço do cliente |
| `retirada` | Cliente retira na pizzaria |
| `balcao` | Pedido consumido no balcão |
| `encomenda` | Pedido encomendado com antecedência |

> ⚠️ **Case-sensitive:** `"Entrega"` ou `"ENTREGA"` são rejeitados com 400.

### Prioridades (`prioridade`)

| Valor | Descrição |
|---|---|
| `baixa` | Sem urgência |
| `normal` | Prioridade padrão |
| `alta` | Atendimento prioritário |
| `urgente` | Máxima urgência |

> ⚠️ **Case-sensitive:** `"Alta"` ou `"URGENTE"` são rejeitados com 400.

### Validações do campo `cliente`
- Obrigatório, tipo `string`.
- Não pode ser vazio nem conter apenas espaços em branco.
- O valor é salvo já com `trim()` aplicado (espaços nas bordas são removidos).

### Validações do campo `valor`
- Obrigatório, tipo `number` literal (não aceita strings como `"350"`, `NaN`, `Infinity`, `null` ou `boolean`).
- Deve ser maior que zero (`valor > 0`).

### Identificadores de pedidos (`id`)
- Devem conter apenas dígitos decimais; notações como `1e2` e `0x1` não são aceitas.
- Devem representar um inteiro positivo seguro, entre `1` e `9007199254740991`.
- Zeros à esquerda são aceitos; por exemplo, `00042` corresponde ao pedido `42`.

---

## Tabela de Transições de Status

| Status Atual | Destinos Permitidos (tipo `entrega`/`encomenda`) | Destinos Permitidos (tipo `retirada`/`balcao`) |
|---|---|---|
| `recebido` | `em_preparacao`, `cancelado` | `em_preparacao`, `cancelado` |
| `em_preparacao` | `enviado`, `cancelado` | **`entregue`**, `cancelado` |
| `enviado` | `entregue` | — *(tipo nunca chega aqui)* |
| `entregue` | *(estado final — nenhuma transição)* | *(estado final — nenhuma transição)* |
| `cancelado` | *(estado final — nenhuma transição)* | *(estado final — nenhuma transição)* |

**Regras especiais:**
- **Exceção de negócio:** pedidos do tipo `retirada` e `balcao` vão de `em_preparacao` **diretamente para `entregue`**, sem passar por `enviado` (o cliente já está no local).
- **Pedido enviado não pode ser cancelado:** após sair da pizzaria, o cancelamento não é mais possível.
- **Transição para o mesmo status é inválida** (retorna 400).
- **Estados finais** (`entregue` e `cancelado`) não aceitam nenhuma transição adicional.

**Ordem de validação no PATCH:**
1. ❓ Pedido existe? → 404 se não.
2. ❓ Body e status válidos? → 400 se não.
3. ❓ Transição permitida? → 400 se não.

---

## Tratamento de Erros

### Formato padrão de todos os erros:
```json
{
  "erro": "Mensagem resumida do erro.",
  "detalhes": [
    "Detalhe específico 1.",
    "Detalhe específico 2."
  ]
}
```

| Situação | Código HTTP |
|---|---|
| Dados de entrada inválidos (cliente, valor, tipo, prioridade) | `400 Bad Request` |
| JSON malformado no body | `400 Bad Request` |
| Status inválido ou ausente no PATCH | `400 Bad Request` |
| Transição de status não permitida | `400 Bad Request` |
| Pedido não encontrado (ID inexistente) | `404 Not Found` |
| ID em formato inválido, inexistente, menor que 1 ou fora do limite seguro | `404 Not Found` |
| Rota não existente | `404 Not Found` |
| Erro inesperado (bug interno) | `500 Internal Server Error` |

> ✅ **Stack traces nunca são vazados ao cliente.** Erros internos retornam sempre a mensagem genérica de 500.

---

## Testes

```bash
npm test
```

**Resultado esperado:** 47 testes passando em 3 suítes.

| Suíte | Cobertura |
|---|---|
| `pedido.validator.test.js` | Validação de `cliente`, `valor`, `tipo`, `prioridade`, `status` e `id` |
| `pedido.service.test.js` | RF01-RF04, todas as transições, incluindo exceções de retirada/balcão |
| `pedido.routes.test.js` | Todos os endpoints, JSON malformado, rotas inexistentes e erro 500 |

**Isolamento:** `pedidoRepository.resetar()` é chamado no `beforeEach` de cada suíte, garantindo IDs e dados independentes entre testes.

---

## Evidências

Os prints de tela estão na pasta `evidencias/`. Consulte `evidencias/README.md` para o passo a passo de como reproduzir cada cenário no Postman.

A coleção Postman importável está em `evidencias/pizzaflow-api.postman_collection.json`.

---

## Decisões de Projeto

| Decisão | Alternativa Considerada | Justificativa |
|---|---|---|
| IDs inválidos (ex: "abc") retornam **404** | Retornar 400 | O recurso `/pedidos/abc` simplesmente não existe; semanticamente é 404 |
| Status inicial sempre `"recebido"` fixo no service | Permitir informar na criação | Garante consistência: cliente não pode criar pedido já "entregue" |
| Transições dependem do **tipo** do pedido | Tabela única sem exceções | Modela a realidade: retirada/balcão não passam por envio |
| `Map` como armazenamento | Array com `findIndex` | `Map` garante `O(1)` na busca por ID e deixa o código mais explícito |
| Classe exportada + singleton | Apenas um singleton | Permite injeção de dependência no service para testes com repositório customizado |
| Validação de `valor` usa `typeof` + `Number.isFinite` | `Number()` e comparação | `Number(NaN)` é `NaN`, `Number(true)` é `1` — o `typeof` rejeita tudo que não é `number` literal |

---

## Uso de IA

A IA foi utilizada neste projeto nas seguintes tarefas:

- **Geração da estrutura inicial do projeto** (arquitetura de pastas, arquivos base, package.json).
- **Implementação completa do código** (todas as camadas: config, routes, controllers, services, validators, repositories, errors, middlewares).
- **Geração dos testes** (unitários e de integração com Supertest).
- **Revisão e redação do README, ESTUDO.md e coleção Postman.**

### Sugestões da IA — Avalie e Ajuste

> ⚠️ **Atenção:** Os exemplos abaixo são marcadores para você ajustar de acordo com o que realmente aconteceu na sua interação com a IA, para ser fiel à realidade.

#### ✅ Sugestão ACEITA
*[Substitua pelo que realmente aconteceu]*
**Exemplo de preenchimento:** A IA sugeriu separar a função `obterTransicoesPermitidas` em `config/dominio.js` em vez de embutir a lógica diretamente no service. Aceitamos porque centraliza a máquina de estados em um único lugar, facilitando manutenção e documentação.

#### ⚠️ Sugestão MODIFICADA
*[Substitua pelo que realmente aconteceu]*
**Exemplo de preenchimento:** A IA propôs que IDs inválidos (`"abc"`) retornassem 400. Modificamos para 404, pois semanticamente o recurso `/pedidos/abc` não existe — é um problema de localização, não de formato da requisição.

#### ❌ Sugestão REJEITADA
*[Substitua pelo que realmente aconteceu]*
**Exemplo de preenchimento:** A IA sugeriu usar `uuid` como identificador dos pedidos em vez de inteiros incrementais. Rejeitamos porque o enunciado especifica explicitamente um contador incremental, e UUIDs tornam os exemplos de requisição menos didáticos.
