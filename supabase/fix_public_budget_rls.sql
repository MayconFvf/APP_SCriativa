-- Correção de leitura pública para o cálculo do orçamento.
-- Este arquivo NÃO libera clientes, orçamentos, perfis ou dados de usuários.
-- Ele libera apenas os cadastros necessários para o chatbot calcular o preço.

grant usage on schema public to anon, authenticated;

grant select on public.configuracoes_calculo to anon, authenticated;
grant select on public.produtos to anon, authenticated;
grant select on public.artes_modelos to anon, authenticated;
grant select on public.servicos to anon, authenticated;

alter table public.configuracoes_calculo enable row level security;
alter table public.produtos enable row level security;
alter table public.artes_modelos enable row level security;
alter table public.servicos enable row level security;

drop policy if exists "Publico le configuracoes de calculo" on public.configuracoes_calculo;
drop policy if exists "Publico le produtos ativos" on public.produtos;
drop policy if exists "Publico le artes ativas" on public.artes_modelos;
drop policy if exists "Publico le servicos ativos" on public.servicos;

create policy "Publico le configuracoes de calculo"
  on public.configuracoes_calculo
  for select
  to anon, authenticated
  using (true);

create policy "Publico le produtos ativos"
  on public.produtos
  for select
  to anon, authenticated
  using (ativo = true);

create policy "Publico le artes ativas"
  on public.artes_modelos
  for select
  to anon, authenticated
  using (ativo = true);

create policy "Publico le servicos ativos"
  on public.servicos
  for select
  to anon, authenticated
  using (ativo = true);
