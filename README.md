# Portfólio e central pessoal

Aplicação Next.js com portfólio público em `/` e uma central pessoal privada em `/admin`. A área administrativa reúne tarefas, finanças, categorias, metas e indicadores mensais, com persistência PostgreSQL e autorização exclusiva por e-mail Google.

## Stack

- Next.js 16, App Router, React 19 e TypeScript
- Tailwind CSS 4
- Auth.js 5 com Google OAuth
- PostgreSQL no Neon e Drizzle ORM
- Zod para validação no servidor
- Deploy preparado para Vercel

## Requisitos

- Node.js 20.9 ou superior
- npm
- Projeto gratuito no Neon
- Credencial OAuth 2.0 do Google do tipo Aplicativo da Web

## Início rápido

```bash
npm install
npm run setup:env
npm run setup:neon-direct
npm run db:migrate
npm run db:seed
npm run dev
```

`setup:env` cria `.env.local` somente se o arquivo ainda não existir e gera
`AUTH_SECRET` sem exibi-lo. Antes das migrations, preencha os valores externos
do Neon, Google e `ADMIN_EMAIL` descritos abaixo.
Se você já possui somente a URL pooled, `setup:neon-direct` deriva o host direct
removendo `-pooler` e salva o resultado sem imprimir credenciais.

Abra `http://localhost:3000` para o portfólio e `http://localhost:3000/admin` para a área privada.

## Variáveis de ambiente

```env
DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://......../neondb?sslmode=require
AUTH_SECRET=<já gerado por npm run setup:env>
AUTH_GOOGLE_ID=<Client ID terminado em .apps.googleusercontent.com>
AUTH_GOOGLE_SECRET=<Client secret do mesmo cliente Web>
ADMIN_EMAIL=<e-mail Google que será o único administrador>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- `DATABASE_URL`: connection string **pooled** do Neon, usada pela aplicação; o host contém `-pooler`.
- `DATABASE_URL_UNPOOLED`: connection string **direct** do mesmo branch, banco e role, usada por migration e seed.
- `AUTH_SECRET`: segredo aleatório local com pelo menos 32 caracteres; `setup:env` o gera.
- `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`: credenciais OAuth do Google.
- `ADMIN_EMAIL`: único e-mail Google autorizado, comparado no servidor sem diferenciar maiúsculas/minúsculas.
- `NEXT_PUBLIC_SITE_URL`: para uso local, exatamente `http://localhost:3000`, sem barra final.

Nunca envie `.env`, `.env.local` ou credenciais ao Git. Eles já estão ignorados.

## Google OAuth

Crie um OAuth Client ID do tipo **Web application**. Para uso local, configure
exatamente um valor em cada lista:

```text
Authorized JavaScript origins:
http://localhost:3000

Authorized redirect URIs:
http://localhost:3000/api/auth/callback/google
```

Não use `127.0.0.1`, não acrescente barra final e não cadastre `/admin` como
callback. Se a audiência for externa e o app estiver em Testing, adicione o
valor de `ADMIN_EMAIL` como test user. O guia completo está em
[docs/google-oauth.md](docs/google-oauth.md).

## Banco de dados

Depois de definir as duas URLs do Neon:

```bash
npm run db:migrate
npm run db:seed
```

Os comandos fora do runtime Next.js agora carregam `.env.local` com a mesma
precedência do framework. Migration, seed e Studio preferem a URL direct. O
seed é opcional e idempotente: insere somente categorias financeiras padrão,
sem criar usuário, e-mail ou segredo. Consulte [docs/neon.md](docs/neon.md).

## Comandos

```bash
npm run dev          # desenvolvimento
npm run lint         # ESLint
npm run typecheck    # TypeScript sem emissão
npm test             # testes críticos
npm run build        # build de produção
npm run check        # lint + typecheck + testes + build
npm run setup:env    # cria .env.local e AUTH_SECRET sem sobrescrever
npm run setup:neon-direct # deriva URL direct sem exibir credenciais
npm run verify:local # valida env, Neon, migrations, tabelas e seed
npm run verify:http  # com dev ativo, valida login/callback e acesso anônimo
npm run verify:auth-http # valida 200/403 com sessões locais efêmeras
npm run db:generate  # gera migration a partir do schema
npm run db:migrate   # aplica migrations pela URL direct
npm run db:seed      # categorias financeiras padrão
npm run db:studio    # interface local do Drizzle
```

## Rotas principais

- `/`: portfólio público, indexável e sem autenticação.
- `/admin/login`: login Google.
- `/admin`: dashboard privado.
- `/admin/tarefas`: CRUD e filtros de tarefas.
- `/admin/financeiro`: CRUD, filtros e resumo financeiro.
- `/admin/financeiro/categorias`: CRUD de categorias.
- `/admin/metas`: CRUD e progresso de metas.
- `/admin/configuracoes`: conta conectada e estado seguro da configuração.
- `/api/admin/summary`: exemplo de endpoint privado com respostas 401/403 explícitas.

Todas as páginas administrativas usam `noindex, nofollow`, e o `robots.txt` bloqueia `/admin` e `/api/admin`.

## Segurança

A autorização não depende da interface. `requireAdmin()` valida sessão e `ADMIN_EMAIL` no servidor, e é chamada pelo layout protegido, por toda Server Action, pela camada de acesso ao banco e pelos endpoints privados. Entradas são validadas com Zod, IDs com UUID, dinheiro com `numeric(14,2)` e operações com queries parametrizadas pelo Drizzle.

Uma conta Google autenticada que não corresponda a `ADMIN_EMAIL` recebe HTTP 403. Uma requisição sem sessão ao endpoint privado recebe HTTP 401.

## Validação local completa

Depois de preencher `.env.local`:

```bash
npm run db:migrate
npm run db:seed
npm run verify:local
npm run check
```

Com `npm run dev` ativo, execute em outro terminal:

```bash
npm run verify:http
npm run verify:auth-http
```

Esse smoke test comprova o callback Google publicado pelo Auth.js, o redirect
anônimo de `/admin`, o `401` mínimo de `/api/admin/summary`, o `200` do admin e
o `403` de outro e-mail. O segundo comando assina sessões efêmeras somente em
memória e as envia apenas a `localhost`, sem imprimir cookie, token, e-mail ou
valores privados. A conclusão OAuth é interativa e deve ser validada no navegador:

1. Entre em `/admin` com `ADMIN_EMAIL`: o dashboard deve abrir.
2. Abra `/api/admin/summary` na mesma sessão: deve retornar `200` e somente
   `balance`, `income`, `expense`, `pendingTasks` e `overdueTasks`.
3. Saia e entre com outro test user Google: `/admin` e a API devem responder
   `403`.

Não copie cookies, tokens, connection strings ou o conteúdo de `.env.local`
para logs ou issues. Os verificadores exibem apenas estados e contagens.

## Vercel

Adicione as sete variáveis acima nos ambientes desejados em Project Settings → Environment Variables. Para produção, altere `NEXT_PUBLIC_SITE_URL` para o domínio real e cadastre o mesmo domínio no cliente OAuth do Google.

Execute as migrations contra o banco de produção antes de usar o painel. O build não aplica migrations automaticamente para evitar alterações inesperadas no banco.

Veja também [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) e o registro da [auditoria inicial](docs/project-audit.md).
