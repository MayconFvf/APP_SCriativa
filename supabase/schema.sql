create extension if not exists "pgcrypto";

-- Perfis de acesso da aplicação. O role separa administradores e clientes.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  cliente_id uuid,
  nome text,
  email text,
  telefone text,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  ativo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

comment on table public.profiles is
  'Perfis autenticados do sistema, diferenciando role admin e cliente.';

-- Perfis administrativos legados, mantidos para compatibilidade com admins já criados.
create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  nome text,
  email text,
  role text default 'admin',
  ativo boolean default true,
  created_at timestamp default now()
);

comment on table public.admin_profiles is
  'Perfis administrativos da SCRIATIVA vinculados aos usuários do Supabase Auth.';

-- Clientes que iniciam orçamento ou criam conta para acompanhar pedidos.
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  user_id uuid unique references auth.users(id) on delete set null,
  nome text not null,
  email text,
  telefone text,
  created_at timestamp default now()
);

comment on table public.clientes is
  'Clientes da SCRIATIVA, com vínculo opcional ao Supabase Auth para acompanhamento de pedidos.';

alter table public.clientes
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists user_id uuid references auth.users(id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_user_id_key'
  ) then
    alter table public.clientes
      add constraint clientes_user_id_key unique (user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_email_unique'
  ) then
    alter table public.clientes
      add constraint clientes_email_unique unique (email);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_auth_user_id_key'
  ) then
    alter table public.clientes
      add constraint clientes_auth_user_id_key unique (auth_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_cliente_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_cliente_id_fkey
      foreign key (cliente_id) references public.clientes(id) on delete set null;
  end if;
end $$;

-- Fornecedores de peças, insumos, impressão, acabamento e serviços externos.
create table if not exists public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  email text,
  observacao text,
  ativo boolean default true,
  created_at timestamp default now()
);

comment on table public.fornecedores is
  'Fornecedores usados para compor custos de produtos e insumos personalizados.';

-- Produtos personalizados disponíveis para orçamento.
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  tipo text,
  tecido text,
  tamanho text,
  cor text,
  fornecedor_id uuid references public.fornecedores(id),
  custo numeric(10,2) not null default 0,
  ativo boolean default true,
  created_at timestamp default now()
);

comment on table public.produtos is
  'Catálogo de produtos base, como camisetas, uniformes, moletons, ecobags e brindes.';

-- Serviços adicionais cobrados ou usados no cálculo interno.
create table if not exists public.servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  valor numeric(10,2) not null default 0,
  ativo boolean default true,
  created_at timestamp default now()
);

comment on table public.servicos is
  'Serviços extras do orçamento, como criação de arte, vetorização, aplicação e acabamento.';

-- Artes prontas, modelos e presets usados para agilizar pedidos.
create table if not exists public.artes_modelos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  descricao text,
  imagem_url text,
  valor_extra numeric(10,2) default 0,
  ativo boolean default true,
  created_at timestamp default now()
);

comment on table public.artes_modelos is
  'Biblioteca de artes prontas e modelos que podem adicionar valor ao orçamento.';

-- Configurações globais de cálculo de preço, custos, margens, taxas e fretes.
create table if not exists public.configuracoes_calculo (
  id uuid primary key default gen_random_uuid(),
  valor_dtf_metro numeric(10,2) default 0,
  valor_dtf_cm2 numeric(10,4) default 0,
  valor_minimo_dtf numeric(10,2) default 0,
  perda_material_percentual numeric(10,2) default 0,
  valor_criacao_arte numeric(10,2) default 0,
  valor_vetorizacao numeric(10,2) default 0,
  valor_ajuste_simples numeric(10,2) default 0,
  valor_arte_pronta numeric(10,2) default 0,
  frete_peca_padrao numeric(10,2) default 0,
  frete_dtf_padrao numeric(10,2) default 0,
  frete_cliente_padrao numeric(10,2) default 0,
  margem_padrao numeric(10,2) default 100,
  margem_minima numeric(10,2) default 30,
  taxa_cartao_percentual numeric(10,2) default 0,
  taxa_embalagem numeric(10,2) default 0,
  taxa_urgencia numeric(10,2) default 0,
  desconto_maximo_percentual numeric(10,2) default 0,
  updated_at timestamp default now()
);

comment on table public.configuracoes_calculo is
  'Parâmetros administrativos usados para calcular DTF, arte, frete, taxas, margem e descontos.';

-- Orçamentos gerados a partir do fluxo público, cliente logado ou painel administrativo.
create table if not exists public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  cliente_id uuid references public.clientes(id),
  produto_id uuid references public.produtos(id),
  arte_modelo_id uuid references public.artes_modelos(id),
  quantidade integer not null,
  resumo_pedido text,
  custo_pecas numeric(10,2) default 0,
  custo_dtf numeric(10,2) default 0,
  custo_arte numeric(10,2) default 0,
  custo_servicos numeric(10,2) default 0,
  custo_frete numeric(10,2) default 0,
  custo_total numeric(10,2) default 0,
  margem_percentual numeric(10,2) default 0,
  preco_venda numeric(10,2) default 0,
  lucro numeric(10,2) default 0,
  status text default 'novo',
  solicitado boolean default false,
  solicitado_em timestamp,
  telefone_whatsapp_destino text default '+5519999926072',
  valores_config_usados jsonb,
  created_at timestamp default now()
);

comment on table public.orcamentos is
  'Orçamentos com resumo público e valores internos de custo, venda, lucro e margem.';

alter table public.orcamentos
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists solicitado boolean default false,
  add column if not exists solicitado_em timestamp,
  add column if not exists telefone_whatsapp_destino text default '+5519999926072';

-- Estampas calculadas por local, medidas e área dentro de um orçamento.
create table if not exists public.orcamento_estampas (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid references public.orcamentos(id) on delete cascade,
  local_estampa text,
  largura_cm numeric(10,2),
  altura_cm numeric(10,2),
  area_cm2 numeric(10,2),
  valor_calculado numeric(10,2),
  created_at timestamp default now()
);

comment on table public.orcamento_estampas is
  'Detalhes das estampas de cada orçamento, incluindo posição, medidas, área e valor calculado.';

-- Serviços vinculados a um orçamento específico.
create table if not exists public.orcamento_servicos (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid references public.orcamentos(id) on delete cascade,
  servico_id uuid references public.servicos(id),
  valor numeric(10,2),
  created_at timestamp default now()
);

comment on table public.orcamento_servicos is
  'Serviços adicionais aplicados em cada orçamento, com valor registrado no momento do cálculo.';

-- Índices principais.
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_cliente_id on public.profiles(cliente_id);
create index if not exists idx_admin_profiles_user_id on public.admin_profiles(user_id);
create index if not exists idx_admin_profiles_email on public.admin_profiles(email);
create index if not exists idx_clientes_user_id on public.clientes(user_id);
create index if not exists idx_clientes_auth_user_id on public.clientes(auth_user_id);
create index if not exists idx_clientes_email on public.clientes(email);
create index if not exists idx_clientes_telefone on public.clientes(telefone);
create index if not exists idx_fornecedores_ativo on public.fornecedores(ativo);
create index if not exists idx_produtos_fornecedor_id on public.produtos(fornecedor_id);
create index if not exists idx_produtos_categoria on public.produtos(categoria);
create index if not exists idx_produtos_ativo on public.produtos(ativo);
create index if not exists idx_servicos_ativo on public.servicos(ativo);
create index if not exists idx_artes_modelos_categoria on public.artes_modelos(categoria);
create index if not exists idx_artes_modelos_ativo on public.artes_modelos(ativo);
create index if not exists idx_orcamentos_cliente_id on public.orcamentos(cliente_id);
create index if not exists idx_orcamentos_auth_user_id on public.orcamentos(auth_user_id);
create index if not exists idx_orcamentos_produto_id on public.orcamentos(produto_id);
create index if not exists idx_orcamentos_status on public.orcamentos(status);
create index if not exists idx_orcamentos_created_at on public.orcamentos(created_at desc);
create index if not exists idx_orcamento_estampas_orcamento_id on public.orcamento_estampas(orcamento_id);
create index if not exists idx_orcamento_servicos_orcamento_id on public.orcamento_servicos(orcamento_id);
create index if not exists idx_orcamento_servicos_servico_id on public.orcamento_servicos(servico_id);

-- Funções auxiliares para RLS.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select p.role from public.profiles p where p.user_id = auth.uid() and p.ativo = true limit 1),
    (select ap.role from public.admin_profiles ap where ap.user_id = auth.uid() and ap.ativo = true limit 1)
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() = 'admin';
$$;

create or replace function public.is_cliente()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() = 'cliente';
$$;

-- Trigger para criar perfil de cliente automaticamente após cadastro no Supabase Auth.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_cliente_id uuid;
  profile_role text;
begin
  profile_role := coalesce(new.raw_user_meta_data->>'role', 'cliente');

  if profile_role = 'cliente' then
    insert into public.clientes (auth_user_id, user_id, nome, email, telefone)
    values (
      new.id,
      new.id,
      coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
      new.email,
      new.raw_user_meta_data->>'telefone'
    )
    on conflict (email) do update set
      auth_user_id = excluded.auth_user_id,
      user_id = excluded.user_id,
      nome = excluded.nome,
      email = excluded.email,
      telefone = excluded.telefone
    returning id into created_cliente_id;
  end if;

  insert into public.profiles (user_id, cliente_id, nome, email, telefone, role)
  values (
    new.id,
    created_cliente_id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'telefone',
    case when profile_role = 'admin' then 'admin' else 'cliente' end
  )
  on conflict (user_id) do update set
    cliente_id = coalesce(public.profiles.cliente_id, excluded.cliente_id),
    nome = excluded.nome,
    email = excluded.email,
    telefone = excluded.telefone,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Row Level Security.
alter table public.profiles enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.clientes enable row level security;
alter table public.fornecedores enable row level security;
alter table public.produtos enable row level security;
alter table public.servicos enable row level security;
alter table public.artes_modelos enable row level security;
alter table public.configuracoes_calculo enable row level security;
alter table public.orcamentos enable row level security;
alter table public.orcamento_estampas enable row level security;
alter table public.orcamento_servicos enable row level security;

-- Remove políticas anteriores para permitir reexecutar este arquivo.
drop policy if exists "Publico pode inserir clientes" on public.clientes;
drop policy if exists "Publico pode inserir orcamentos" on public.orcamentos;
drop policy if exists "Autenticados podem administrar admin_profiles" on public.admin_profiles;
drop policy if exists "Autenticados podem administrar clientes" on public.clientes;
drop policy if exists "Autenticados podem administrar fornecedores" on public.fornecedores;
drop policy if exists "Autenticados podem administrar produtos" on public.produtos;
drop policy if exists "Autenticados podem administrar servicos" on public.servicos;
drop policy if exists "Autenticados podem administrar artes_modelos" on public.artes_modelos;
drop policy if exists "Autenticados podem administrar configuracoes_calculo" on public.configuracoes_calculo;
drop policy if exists "Autenticados podem administrar orcamentos" on public.orcamentos;
drop policy if exists "Autenticados podem administrar orcamento_estampas" on public.orcamento_estampas;
drop policy if exists "Autenticados podem administrar orcamento_servicos" on public.orcamento_servicos;
drop policy if exists "Admins administram profiles" on public.profiles;
drop policy if exists "Usuarios leem proprio profile" on public.profiles;
drop policy if exists "Clientes criam proprio profile" on public.profiles;
drop policy if exists "Admins administram admin_profiles" on public.admin_profiles;
drop policy if exists "Publico cria clientes" on public.clientes;
drop policy if exists "Clientes leem proprio cadastro" on public.clientes;
drop policy if exists "Clientes atualizam proprio cadastro" on public.clientes;
drop policy if exists "Clientes inserem proprio cadastro" on public.clientes;
drop policy if exists "Admins administram clientes" on public.clientes;
drop policy if exists "Admins administram fornecedores" on public.fornecedores;
drop policy if exists "Admins administram produtos" on public.produtos;
drop policy if exists "Admins administram servicos" on public.servicos;
drop policy if exists "Admins administram artes_modelos" on public.artes_modelos;
drop policy if exists "Admins administram configuracoes_calculo" on public.configuracoes_calculo;
drop policy if exists "Publico cria orcamentos" on public.orcamentos;
drop policy if exists "Clientes criam proprios orcamentos" on public.orcamentos;
drop policy if exists "Clientes leem proprios orcamentos" on public.orcamentos;
drop policy if exists "Admins administram orcamentos" on public.orcamentos;
drop policy if exists "Admins administram orcamento_estampas" on public.orcamento_estampas;
drop policy if exists "Admins administram orcamento_servicos" on public.orcamento_servicos;

-- Profiles.
create policy "Admins administram profiles"
  on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Usuarios leem proprio profile"
  on public.profiles
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Clientes criam proprio profile"
  on public.profiles
  for insert
  to authenticated
  with check (user_id = auth.uid() and role = 'cliente');

-- Admin profiles.
create policy "Admins administram admin_profiles"
  on public.admin_profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Clientes.
create policy "Publico cria clientes"
  on public.clientes
  for insert
  to anon
  with check (true);

create policy "Clientes leem proprio cadastro"
  on public.clientes
  for select
  to authenticated
  using (auth_user_id = auth.uid() or user_id = auth.uid());

create policy "Clientes atualizam proprio cadastro"
  on public.clientes
  for update
  to authenticated
  using (
    auth_user_id = auth.uid()
    or user_id = auth.uid()
    or (auth_user_id is null and email = auth.jwt()->>'email')
  )
  with check (auth_user_id = auth.uid() or user_id = auth.uid());

create policy "Clientes inserem proprio cadastro"
  on public.clientes
  for insert
  to authenticated
  with check (auth_user_id = auth.uid());

create policy "Admins administram clientes"
  on public.clientes
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Tabelas internas de catálogo e cálculo.
create policy "Admins administram fornecedores"
  on public.fornecedores
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins administram produtos"
  on public.produtos
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins administram servicos"
  on public.servicos
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins administram artes_modelos"
  on public.artes_modelos
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins administram configuracoes_calculo"
  on public.configuracoes_calculo
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Orçamentos.
create policy "Publico cria orcamentos"
  on public.orcamentos
  for insert
  to anon
  with check (true);

create policy "Clientes criam proprios orcamentos"
  on public.orcamentos
  for insert
  to authenticated
  with check (
    public.is_cliente()
    and auth_user_id = auth.uid()
  );

create policy "Clientes leem proprios orcamentos"
  on public.orcamentos
  for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy "Admins administram orcamentos"
  on public.orcamentos
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins administram orcamento_estampas"
  on public.orcamento_estampas
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins administram orcamento_servicos"
  on public.orcamento_servicos
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
