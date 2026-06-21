-- Permite que o chatbot publico calcule usando os parametros vigentes do admin.
-- Rode este arquivo depois do schema principal.

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
