# GIT.md — Passo a Passo: git init até git push

## Pré-requisitos

Certifique-se de ter o Git instalado:
```bash
git --version
```

---

## Parte 1 — Configuração inicial do repositório local

```bash
# Acesse a pasta do projeto
cd c:/Users/Michele/Downloads/API_Gerenciamentos

# O repositório já foi inicializado. Confirme:
git status
```

---

## Parte 2 — Configurar identidade no Git

Cada integrante deve configurar seu nome e e-mail **antes de fazer seus commits**.

### Pedro Akylas (faz os commits 1, 2, 3, 4)

```bash
git config user.name "Pedro Akylas"
git config user.email "pedro.akylas@email.com"
```

### Rafaela Marques (faz os commits 5, 6, 7)

```bash
git config user.name "Rafaela Marques"
git config user.email "rafaela.marques@email.com"
```

> **Observação:** `git config` sem `--global` aplica a configuração apenas neste repositório.

---

## Parte 3 — Sequência de commits significativos

### Commit 1 — Pedro (estrutura inicial)

```bash
git config user.name "Pedro Akylas"
git config user.email "pedro.akylas@email.com"

git add package.json .gitignore
git commit -m "chore: inicializa projeto Node.js, .gitignore e dependências"
```

---

### Commit 2 — Pedro (estrutura e servidor)

```bash
git add src/server.js src/app.js src/config/dominio.js src/errors/ src/middlewares/
git commit -m "feat: cria estrutura em camadas e configura servidor Express"
```

---

### Commit 3 — Pedro (RF01 e RF02)

```bash
git add src/repositories/ src/validators/ src/services/ src/controllers/ src/routes/
git commit -m "feat: implementa cadastro e listagem de pedidos (RF01 e RF02)"
```

---

### Commit 4 — Pedro (RF03)

```bash
# Neste ponto a rota GET /:id já está implementada junto com o service.
# Faça uma pequena melhoria na mensagem de erro do buscarPorId e commite:
git add src/services/pedido.service.js src/validators/pedido.validator.js
git commit -m "feat: implementa consulta por ID com tratamento de 404 (RF03)"
```

---

### Commit 5 — Rafaela (RF04)

```bash
git config user.name "Rafaela Marques"
git config user.email "rafaela.marques@email.com"

git add src/services/pedido.service.js src/config/dominio.js
git commit -m "feat: implementa atualizacao de status com maquina de estados (RF04)"
```

---

### Commit 6 — Rafaela (testes)

```bash
git add tests/
git commit -m "test: adiciona testes unitarios e de integracao (47 casos)"
```

---

### Commit 7 — Rafaela (documentação e evidências)

```bash
git add README.md ESTUDO.md evidencias/ GIT.md
git commit -m "docs: adiciona README, ESTUDO, colecao Postman e pasta de evidencias"
```

---

## Parte 4 — Criar repositório no GitHub e fazer o push

1. Acesse https://github.com/new
2. Crie um repositório **público** com o nome `pizzaflow-api` (sem inicializar com README).
3. Copie a URL do repositório (ex: `https://github.com/SEU_USUARIO/pizzaflow-api.git`).

```bash
# Adiciona o remote (substitua pela URL real)
git remote add origin https://github.com/SEU_USUARIO/pizzaflow-api.git

# Confirme a branch principal
git branch -M main

# Envia todos os commits
git push -u origin main
```

---

## Verificação final

```bash
# Veja o histórico de commits com autores
git log --oneline --format="%h %an %s"
```

Deve aparecer algo como:
```
abc1234 Rafaela Marques docs: adiciona README, ESTUDO, colecao Postman e pasta de evidencias
def5678 Rafaela Marques test: adiciona testes unitarios e de integracao (47 casos)
ghi9012 Rafaela Marques feat: implementa atualizacao de status com maquina de estados (RF04)
jkl3456 Pedro Akylas feat: implementa consulta por ID com tratamento de 404 (RF03)
mno7890 Pedro Akylas feat: implementa cadastro e listagem de pedidos (RF01 e RF02)
pqr1234 Pedro Akylas feat: cria estrutura em camadas e configura servidor Express
stu5678 Pedro Akylas chore: inicializa projeto Node.js, .gitignore e dependências
```

