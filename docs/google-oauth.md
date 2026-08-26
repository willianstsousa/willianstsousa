# Configuração do Google OAuth

O projeto usa o provider Google do Auth.js 5. As credenciais permanecem somente no servidor.

## 1. Criar ou selecionar um projeto

1. Acesse o Google Cloud Console.
2. Crie um projeto ou selecione um projeto existente.
3. Abra Google Auth Platform.

## 2. Configurar a tela de consentimento

1. Preencha nome do app, e-mail de suporte e contato do desenvolvedor.
2. Use audiência externa para uma conta Google comum ou interna somente se a conta pertencer à organização Google Workspace escolhida.
3. Se o app permanecer em modo de teste, adicione o e-mail administrador como usuário de teste.
4. Use somente os escopos básicos `openid`, `email` e `profile`, solicitados pelo Auth.js; não adicione escopos sensíveis.

## 3. Criar o cliente OAuth

1. Em Clients/Credenciais, crie um OAuth Client ID.
2. Escolha **Web application / Aplicativo da Web**.
3. Para uso local, adicione exatamente esta origem JavaScript autorizada:

   ```text
   http://localhost:3000
   ```

4. Para uso local, adicione exatamente esta URI de redirecionamento:

   ```text
   http://localhost:3000/api/auth/callback/google
   ```

5. Salve e copie Client ID e Client Secret.

Não use `127.0.0.1`, não acrescente barra final e não use `/admin` como callback.
Para produção, adicione separadamente `https://SEU_DOMINIO` como origem e
`https://SEU_DOMINIO/api/auth/callback/google` como redirect URI. Se usar também
`www`, cadastre cada origem e callback. O host usado para iniciar o login deve
corresponder exatamente a uma URI cadastrada.

## 4. Configurar localmente

Execute `npm run setup:env` e preencha em `.env.local` somente os valores
externos abaixo. O comando já gera `AUTH_SECRET` e nunca o exibe:

```env
AUTH_GOOGLE_ID=client-id-fornecido-pelo-google
AUTH_GOOGLE_SECRET=client-secret-fornecido-pelo-google
ADMIN_EMAIL=email-google-exato-autorizado
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

O e-mail não fica no código ou no banco. A comparação com `ADMIN_EMAIL` ocorre exclusivamente no servidor.

## 5. Configurar na Vercel

Em Project Settings → Environment Variables, adicione `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAIL` e `NEXT_PUBLIC_SITE_URL`. Use o domínio final em `NEXT_PUBLIC_SITE_URL` e habilite as variáveis nos ambientes apropriados.

Faça um novo deploy depois de alterar as variáveis.

## 6. Validar

1. Com `npm run dev` ativo, execute `npm run verify:http` em outro terminal.
2. Acesse `/admin` sem sessão: deve abrir `/admin/login`.
3. Entre com o e-mail definido em `ADMIN_EMAIL`: deve abrir o dashboard.
4. Abra `/api/admin/summary` na mesma sessão: deve retornar 200.
5. Saia e tente outro test user Google: `/admin` e a API devem responder 403.
6. Confirme que `/` continua público.

O verificador HTTP não imprime cookies nem credenciais. A conclusão do OAuth e
os casos autenticados exigem o navegador porque o Google precisa autenticar uma
conta real.

Erros `redirect_uri_mismatch` indicam que a origem/callback acessada não foi cadastrada exatamente no cliente OAuth correto.
