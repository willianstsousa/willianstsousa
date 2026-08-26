# Resumo da implementação

## O que foi implementado

- Portfólio público responsivo em `/`, baseado no nome, tecnologias e links encontrados no repositório.
- Área privada em `/admin` com login Google e autorização por um único `ADMIN_EMAIL`.
- Dashboard mensal com receitas, despesas, saldo, tarefas pendentes/vencidas, metas, últimas movimentações e próximas tarefas.
- CRUD de tarefas, com status, prioridade, vencimento opcional, conclusão e filtros.
- CRUD financeiro de receitas e despesas, com categorias, data, observação e filtros por mês, tipo e categoria.
- CRUD de categorias financeiras, com proteção contra exclusão de categoria em uso.
- CRUD de metas e atualização rápida do valor atual, com progresso limitado de 0% a 100%.
- Layout administrativo responsivo, navegação móvel, logout e página de configurações sem exposição de segredos.
- Endpoint privado de resumo com respostas 401, 403 e 500 semanticamente corretas.
- SEO público, sitemap, imagem social e bloqueio de indexação das rotas administrativas.

## Arquitetura

A aplicação usa Next.js 16 com App Router, React Server Components e Server Actions. A interface permanece fina; consultas e mutations ficam em `src/lib/admin`, o schema e cliente ficam em `src/db`, e a política de autorização fica centralizada em `src/lib/auth`.

`requireAdmin()` é aplicado no layout administrativo, nas Server Actions e novamente na camada de dados. Route Handlers que precisam distinguir autenticação e autorização usam o mesmo estado centralizado e retornam 401/403 explicitamente. Dados de formulário são tratados como não confiáveis e validados com Zod antes de qualquer mutation.

Não foi instalado shadcn/ui porque o repositório não possuía um design system prévio e os componentes necessários eram pequenos. Isso reduz dependências e mantém a interface consistente com utilitários Tailwind locais.

## Arquivos importantes

- `src/auth.ts`: configuração Auth.js/Google.
- `src/lib/auth/authorization.ts`: sessão, autorização e `requireAdmin()`.
- `src/lib/auth/policy.ts`: comparação de e-mail e proteção contra open redirect.
- `src/db/schema/index.ts`: schema tipado do PostgreSQL.
- `src/db/migrations/0000_lovely_tattoo.sql`: migration inicial.
- `src/lib/admin/queries.ts`: consultas protegidas.
- `src/lib/admin/mutations.ts`: mutations protegidas.
- `src/app/admin/(protected)`: páginas administrativas.
- `src/app/admin/_actions`: Server Actions protegidas e validadas.
- `src/app/api/admin/summary/route.ts`: endpoint privado.
- `src/lib/validation/admin.ts`: validações Zod e conversão monetária exata.
- `scripts/seed.ts`: seed opcional de categorias.
- `docs/google-oauth.md` e `docs/neon.md`: configuração manual.

## Banco de dados

Tabelas criadas:

- `tasks`
- `financial_categories`
- `transactions`
- `goals`

Valores monetários usam `numeric(14,2)`, e a aplicação faz somas com centavos em `bigint`, sem cálculos de dinheiro em ponto flutuante. Datas financeiras usam o tipo PostgreSQL `date`, evitando deslocamento de dia por UTC. Há índices para status, vencimento, tipo, categoria e data.

A migration inicial foi gerada e revisada em `src/db/migrations/0000_lovely_tattoo.sql`. O seed insere categorias padrão com `onConflictDoNothing` e não contém usuário, e-mail, senha ou segredo.

## Autenticação

O Auth.js 5 inicia o OAuth com Google e cria uma sessão JWT de 12 horas. Ao acessar `/admin`, uma pessoa sem sessão é enviada para `/admin/login`. Depois do login, o e-mail da sessão é comparado no servidor com `ADMIN_EMAIL`. Correspondência libera o painel; uma conta diferente recebe 403.

O callback pós-login aceita somente caminhos locais iniciados por `/admin`, impedindo open redirect. O portfólio não depende de sessão.

## Variáveis necessárias

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=https://SEU_DOMINIO
```

## Configuração Google

Crie um cliente OAuth do tipo Aplicativo da Web e configure:

```text
http://localhost:3000/api/auth/callback/google
https://SEU_DOMINIO/api/auth/callback/google
```

Copie Client ID e Client Secret para `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`. O passo a passo completo está em `docs/google-oauth.md`.

## Configuração Neon

Crie um projeto PostgreSQL gratuito, copie a URL pooled para `DATABASE_URL` e execute `npm run db:migrate`. Opcionalmente execute `npm run db:seed`. Consulte `docs/neon.md`.

## Configuração Vercel

Adicione exatamente estas variáveis em Project Settings → Environment Variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

Use o domínio HTTPS real em `NEXT_PUBLIC_SITE_URL`, cadastre o mesmo host no Google e faça um novo deploy. Não foram alterados DNS ou projeto Vercel, pois não havia CLI autenticada nem vínculo local do projeto.

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Testes realizados

- `npm install`: concluído.
- `npm run lint`: concluído sem erros ou avisos.
- `npm run typecheck`: concluído sem erros.
- `npm test`: 6 testes aprovados, cobrindo autorização, callback seguro, cálculos financeiros e validações.
- `npm run build`: build de produção concluído; páginas públicas estáticas e rotas administrativas dinâmicas.
- `npm run db:generate`: migration inicial gerada com 4 tabelas.
- `npm run db:migrate -- --help` e `npm run db:studio -- --help`: comandos validados pela CLI. Não foram executados contra um banco inexistente.
- Verificação HTTP local: `/` → 200; `/admin` sem sessão → 307 para login; `/admin/login` → 200; `/api/admin/summary` sem sessão → 401.
- `npm audit --omit=dev --audit-level=moderate`: 0 vulnerabilidades de produção.

O audit completo reporta quatro avisos moderados somente em dependências transitivas de desenvolvimento do `drizzle-kit`, sem correção disponível na versão atual. Eles não fazem parte do bundle de produção.

## Pendências manuais

1. Criar ou escolher o projeto gratuito no Neon e preencher `DATABASE_URL`.
2. Aplicar `npm run db:migrate` e, se desejado, `npm run db:seed`.
3. Criar o cliente OAuth no Google, cadastrar as duas callbacks e preencher as credenciais.
4. Gerar `AUTH_SECRET` e definir o único `ADMIN_EMAIL`.
5. Adicionar as seis variáveis na Vercel e publicar o novo código.

## Como validar

- [ ] `/` carrega sem autenticação no domínio final.
- [ ] `/admin` sem sessão apresenta o login.
- [ ] A conta de `ADMIN_EMAIL` acessa o dashboard e persiste um item de cada módulo.
- [ ] Outra conta Google recebe 403.
- [ ] `/api/admin/summary` sem sessão retorna 401 e com conta não autorizada retorna 403.
- [ ] Logout volta ao portfólio.
- [ ] `robots.txt` bloqueia `/admin` e o HTML administrativo contém `noindex, nofollow`.
- [ ] `npm run check` termina com sucesso no ambiente configurado.
