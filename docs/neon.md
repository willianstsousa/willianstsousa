# Configuração do Neon PostgreSQL

## 1. Criar o banco

1. Crie uma conta no Neon e um projeto no plano gratuito.
2. Escolha uma região próxima do runtime da Vercel quando possível.
3. No modal **Connect**, copie duas connection strings do mesmo branch, database
   e role: uma com **Connection pooling** ligado e outra com pooling desligado.

Ela tem formato semelhante a:

```text
DATABASE_URL=postgresql://usuario:senha@ep-exemplo-pooler.regiao.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://usuario:senha@ep-exemplo.regiao.aws.neon.tech/neondb?sslmode=require
```

Nunca coloque essa URL em arquivos versionados ou em variáveis `NEXT_PUBLIC_*`.
A aplicação usa a URL pooled. Drizzle migration, seed e Studio preferem a URL
direct, como recomendado pelo Neon para operações de schema e com estado de
sessão.

## 2. Configurar localmente

Em `.env.local`:

```env
DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://......../neondb?sslmode=require
```

Mantenha todos os parâmetros fornecidos pelo Neon, inclusive
`channel_binding=require` quando ele estiver presente. Não remova nem
re-codifique a senha da URL copiada.

Se você já tiver apenas a URL pooled, o comando abaixo cria a variável direct
removendo `-pooler` do host, sem imprimir nem substituir credenciais existentes:

```bash
npm run setup:neon-direct
```

## 3. Aplicar o schema

```bash
npm run db:migrate
npm run db:seed
```

- `db:migrate` aplica a migration versionada em `src/db/migrations`.
- `db:seed` é opcional e insere categorias padrão com `onConflictDoNothing`, podendo ser repetido com segurança.
- `db:studio` abre a ferramenta local de inspeção, desde que `DATABASE_URL` esteja definida.
- Os comandos carregam `.env.local` e usam `DATABASE_URL_UNPOOLED` quando ela existe.

Valide sem imprimir connection strings:

```bash
npm run verify:local
```

O verificador testa conexão, histórico Drizzle, quatro tabelas e as 13
categorias padrão. Mensagens de erro do driver são suprimidas para não vazar
credenciais.

Para evoluir o schema no futuro:

```bash
npm run db:generate
npm run db:migrate
```

Revise o SQL gerado antes de aplicá-lo em produção.

## 4. Configurar na Vercel

1. Abra Project Settings → Environment Variables.
2. Adicione `DATABASE_URL` e `DATABASE_URL_UNPOOLED` como secrets nos ambientes necessários.
3. Faça um novo deploy.
4. Aplique migrations explicitamente com a `DATABASE_URL` de produção em um ambiente seguro. O build não altera o banco automaticamente.

## Estrutura criada

- `tasks`: tarefas, prioridade, status, vencimento e conclusão.
- `financial_categories`: categorias separadas por receita/despesa.
- `transactions`: receitas/despesas em `numeric(14,2)` e data sem timezone.
- `goals`: metas, valores monetários, progresso, prazo e status.

Todas usam UUID, timestamps e índices para os filtros principais. Transações referenciam categorias com exclusão restrita para evitar perda acidental de classificação histórica.
