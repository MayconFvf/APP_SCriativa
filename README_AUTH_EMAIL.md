# Confirmação de e-mail - SCRIATIVA

Este projeto usa Supabase Auth para cadastro e login de clientes.

## Redirect do app

No cadastro do cliente, o app envia o redirect para:

```text
${window.location.origin}/auth/callback
```

A rota `/auth/callback` confirma a sessão retornada pelo Supabase e redireciona o cliente para:

- `/resultado`, quando existir orçamento pendente.
- `/cliente/pedidos`, quando não existir orçamento pendente.

## Configuração no Supabase

No painel do Supabase, acesse **Authentication > URL Configuration**.

Configure:

```text
Site URL:
https://SEU-DOMINIO.com

Redirect URLs:
https://SEU-DOMINIO.com/auth/callback
http://localhost:5173/auth/callback
```

Substitua `https://SEU-DOMINIO.com` pelo domínio real do sistema em produção.

## Template de e-mail sugerido

No painel do Supabase, acesse **Authentication > Email Templates > Confirm signup**.

Assunto:

```text
Confirme seu acesso à SCRIATIVA
```

Texto:

```text
Olá,

Você solicitou acesso à área do cliente SCRIATIVA, uma plataforma desenvolvida pela My Dev Solutions para acompanhar orçamentos e pedidos personalizados.

Para confirmar seu cadastro e acessar sua conta, clique no botão abaixo:

Confirmar meu acesso

Se você não solicitou este acesso, ignore este e-mail.

SCRIATIVA | Plataforma desenvolvida por My Dev Solutions
```

Use o link/botão padrão do Supabase para o token de confirmação. O destino final deve estar autorizado nas Redirect URLs.

## Reenvio

O app possui a rota:

```text
/cliente/reenviar-confirmacao
```

Ela usa `supabase.auth.resend` com `type: "signup"` e o mesmo redirect `/auth/callback`.
