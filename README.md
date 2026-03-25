# 💰 Finance App API

Uma API de gestão financeira de alta performance desenvolvida com **Node.js**, **Fastify** e **Drizzle ORM**. O projeto foi concebido utilizando **Clean Architecture** e **TDD (Test-Driven Development)**, garantindo uma base de código sólida, desacoplada e extremamente confiável.

## 🎯 Diferenciais do Projeto

- **Arquitetura Limpa (Clean Arch):** Separação rigorosa de preocupações entre camadas de domínio, casos de uso e infraestrutura.
- **Domínio Orientado a Testes (TDD):** Desenvolvimento guiado por testes unitários, de integração e E2E (End-to-End).
- **SQL Views de Performance:** Cálculos de saldo e estatísticas processados diretamente no PostgreSQL via Views, garantindo precisão decimal e velocidade.
- **Injeção de Dependência:** Uso de `tsyringe` para gerenciamento de dependências e inversão de controle (IoC).
- **Padrões de Commits:** Histórico de mensagens padronizado (lowercase e sem pontuação final) para facilitar o versionamento.

## 🛠️ Tecnologias

- **Runtime:** Node.js (v20+)
- **Framework:** Fastify
- **ORM:** Drizzle ORM (PostgreSQL)
- **Validação:** Zod
- **Dependency Injection:** TSyringe
- **Test Runner:** Node.js Native Test Runner (`node:test`)
- **Utilitários:** Husky, Lint-Staged, TSX

## 🧪 Estratégia de Testes

O projeto implementa uma pirâmide de testes completa:

1. **Unitários (Services):** Validam regras de negócio isoladas.
2. **Unitários (Controllers):** Validam fluxo de entrada/saída usando mocks do Fastify (`app.inject`).
3. **Integração (Services):** Validam a comunicação real com o PostgreSQL e operações do Drizzle.
4. **E2E (Controllers/Routes):** Validam o ciclo completo da requisição: Middlewares -> JWT -> Zod -> Service -> Database.

## ⚙️ Como Executar

1. Clone o repositório:

```bash
git clone [https://github.com/adrjmiranda/finance-app-api.git](https://github.com/adrjmiranda/finance-app-api.git)
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente baseando-se no `.env.example`.

4. Execute as migrations:

```bash
npx drizzle-kit push
```

5. Rode a suíte de testes:

```bash
npx dotenv-cli -e .env.test -- node --import tsx --test ./src/**/*.test.ts
```

6. Inicie em modo de desenvolvimento:

```bash
npm run dev
```

## 📐 Padrões de Código

- Língua: Código em Inglês (variáveis, funções, logs).
- Respostas: Chat/Interações em Português (pt-BR).
- Commits: Mensagens sempre em letras minúsculas e sem ponto final no cabeçalho.
- Tipagem: Uso estrito de TypeScript, evitando any e tratando undefined de forma segura.

Desenvolvido por [Adriano Miranda](https://github.com/adrjmiranda) - 2026.
