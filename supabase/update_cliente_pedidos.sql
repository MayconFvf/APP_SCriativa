alter table public.clientes
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

alter table public.orcamentos
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists solicitado boolean default false,
  add column if not exists solicitado_em timestamp,
  add column if not exists telefone_whatsapp_destino text default '+5519999926072';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'clientes_auth_user_id_key'
  ) then
    alter table public.clientes
      add constraint clientes_auth_user_id_key unique (auth_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'clientes_email_unique'
  ) then
    alter table public.clientes
      add constraint clientes_email_unique unique (email);
  end if;
end $$;

create index if not exists idx_clientes_auth_user_id on public.clientes(auth_user_id);
create index if not exists idx_clientes_email_lookup on public.clientes(email);
create index if not exists idx_orcamentos_auth_user_id on public.orcamentos(auth_user_id);
create index if not exists idx_orcamentos_solicitado on public.orcamentos(solicitado);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = auth.uid()
      and ap.ativo = true
      and ap.role = 'admin'
  );
$$;

drop policy if exists "Clientes leem proprio cadastro" on public.clientes;
drop policy if exists "Clientes atualizam proprio cadastro" on public.clientes;
drop policy if exists "Clientes inserem proprio cadastro" on public.clientes;
drop policy if exists "Admins administram clientes" on public.clientes;
drop policy if exists "Clientes criam proprios orcamentos" on public.orcamentos;
drop policy if exists "Clientes leem proprios orcamentos" on public.orcamentos;
drop policy if exists "Admins administram orcamentos" on public.orcamentos;

create policy "Clientes leem proprio cadastro"
  on public.clientes
  for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy "Clientes atualizam proprio cadastro"
  on public.clientes
  for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

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

create policy "Clientes criam proprios orcamentos"
  on public.orcamentos
  for insert
  to authenticated
  with check (auth_user_id = auth.uid());

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