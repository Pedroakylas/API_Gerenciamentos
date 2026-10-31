# Evidências — PizzaFlow API

Pasta destinada aos prints de tela (capturas do Postman) exigidos na avaliação.

---

## Pré-requisitos

1. Instale as dependências: `npm install`
2. Inicie o servidor: `npm start`
3. Abra o Postman e importe o arquivo `pizzaflow-api.postman_collection.json` desta pasta.
4. Configure a variável de ambiente `baseUrl = http://localhost:3000` (já configurada na coleção).

---

## Passo a Passo de Cada Print

### 01 — `01-criacao.png` · Criação Válida (POST 201)

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `{{baseUrl}}/pedidos` |
| **Content-Type** | `application/json` |

**Corpo da requisição:**
```json
{
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal"
}
```

**O que deve aparecer na resposta:**
- Código HTTP: `201 Created`
- Corpo:
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

**O que capturar no print:** painel de resposta do Postman mostrando o código `201` e o corpo JSON acima.

---

### 02 — `02-validacao.png` · Criação Inválida (POST 400)

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **URL** | `{{baseUrl}}/pedidos` |
| **Content-Type** | `application/json` |

**Corpo da requisição:**
```json
{
  "cliente": "   ",
  "tipo": "motoboy",
  "valor": -10,
  "prioridade": "maxima"
}
```

**O que deve aparecer na resposta:**
- Código HTTP: `400 Bad Request`
- Corpo com `erro` e array `detalhes` listando os 4 erros encontrados:
```json
{
  "erro": "Dados de requisição inválidos.",
  "detalhes": [
    "O campo 'cliente' não pode ser vazio ou conter apenas espaços.",
    "O campo 'tipo' é inválido. Valores permitidos: [entrega, retirada, balcao, encomenda].",
    "O campo 'valor' deve ser maior que zero.",
    "O campo 'prioridade' é inválida. Valores permitidos: [baixa, normal, alta, urgente]."
  ]
}
```

**O que capturar no print:** código `400` e a lista de erros no campo `detalhes`.

---

### 03 — `03-listagem.png` · Listagem de Pedidos (GET 200)

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `{{baseUrl}}/pedidos` |

> Execute **primeiro** a requisição 01 para que haja pedidos na lista.

**O que deve aparecer na resposta:**
- Código HTTP: `200 OK`
- Corpo: array JSON com os pedidos cadastrados:
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

**O que capturar no print:** código `200` e a lista de pedidos.

---

### 04 — `04-consulta-inexistente.png` · Consulta por ID Inexistente (GET 404)

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **URL** | `{{baseUrl}}/pedidos/9999` |

**O que deve aparecer na resposta:**
- Código HTTP: `404 Not Found`
- Corpo:
```json
{
  "erro": "Pedido com ID '9999' não encontrado.",
  "detalhes": [
    "Nenhum pedido foi localizado com o identificador fornecido."
  ]
}
```

**O que capturar no print:** código `404` e a mensagem de não encontrado.

---

### 05 — `05-atualizacao.png` · Atualização de Status Válida (PATCH 200)

| Campo | Valor |
|---|---|
| **Método** | `PATCH` |
| **URL** | `{{baseUrl}}/pedidos/1/status` |
| **Content-Type** | `application/json` |

> Execute **primeiro** a requisição 01 para criar o pedido de ID 1.

**Corpo da requisição:**
```json
{
  "status": "em_preparacao"
}
```

**O que deve aparecer na resposta:**
- Código HTTP: `200 OK`
- Corpo com o pedido atualizado:
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

**O que capturar no print:** código `200` e o campo `"status": "em_preparacao"` no corpo.

---

## Arquivos de evidência esperados

| Arquivo | Descrição |
|---|---|
| `01-criacao.png` | POST válido — 201 Created |
| `02-validacao.png` | POST inválido — 400 Bad Request |
| `03-listagem.png` | GET lista — 200 OK |
| `04-consulta-inexistente.png` | GET ID inexistente — 404 Not Found |
| `05-atualizacao.png` | PATCH de status válido — 200 OK |

