# Supabase - SCRIATIVA Orçamentos

Este projeto possui o schema principal em `supabase/schema.sql`.

Depois de rodar o schema principal, rode também as migrations complementares:

```text
supabase/update_cliente_pedidos.sql
supabase/update_calculo_orcamento_publico.sql
supabase/fix_public_budget_rls.sql
supabase/update_artes_storage.sql
```

## Como rodar

1. Acesse o painel do Supabase.
2. Abra o projeto usado pelo sistema.
3. Vá em **SQL Editor**.
4. Crie uma nova query.
5. Cole o conteúdo de `supabase/schema.sql`.
6. Execute a query.

## O que o SQL cria

- Tabelas para perfis, admin, clientes, fornecedores, produtos, serviços, artes/modelos, configurações, orçamentos, estampas e serviços do orçamento.
- Roles em `profiles`: `admin` e `cliente`.
- Vínculo entre cliente e Supabase Auth por `clientes.user_id`.
- Trigger em `auth.users` para criar perfil e cliente automaticamente quando uma conta cliente é criada.
- Índices principais para filtros e relacionamentos.
- RLS habilitado em todas as tabelas.
- Inserção pública em `clientes` e `orcamentos`.
- Cliente autenticado lê apenas o próprio cadastro e os próprios orçamentos.
- Admin autenticado administra clientes, orçamentos, catálogo, serviços, artes, fornecedores e configurações.
- Bucket público `artes-modelos` no Supabase Storage para imagens das artes prontas.

## Rotas de autenticação

- Admin: `/gestao-scriativa`
- Cliente login: `/cliente/login`
- Cliente cadastro: `/cliente/cadastro`
- Cliente painel: `/cliente/painel`
- Cliente pedidos: `/cliente/pedidos`

## Admin

Depois de criar a usuária admin no Supabase Auth, defina o perfil dela com `role = 'admin'` em `profiles` ou `admin_profiles`.

## Variáveis

O arquivo `.env.example` mostra as variáveis necessárias:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Depois de criar o projeto no Supabase, copie os valores públicos do painel para um arquivo `.env` local.
