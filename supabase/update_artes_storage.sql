-- Bucket de imagens para Artes Prontas da SCRIATIVA.
-- Rode este arquivo no SQL Editor do Supabase antes de usar o upload no painel admin.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artes-modelos',
  'artes-modelos',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Publico visualiza imagens de artes prontas" on storage.objects;
drop policy if exists "Admin envia imagens de artes prontas" on storage.objects;
drop policy if exists "Admin atualiza imagens de artes prontas" on storage.objects;
drop policy if exists "Admin exclui imagens de artes prontas" on storage.objects;

create policy "Publico visualiza imagens de artes prontas"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'artes-modelos');

create policy "Admin envia imagens de artes prontas"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'artes-modelos'
    and exists (
      select 1
      from public.admin_profiles
      where user_id = auth.uid()
        and role = 'admin'
        and ativo = true
    )
  );

create policy "Admin atualiza imagens de artes prontas"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'artes-modelos'
    and exists (
      select 1
      from public.admin_profiles
      where user_id = auth.uid()
        and role = 'admin'
        and ativo = true
    )
  )
  with check (
    bucket_id = 'artes-modelos'
    and exists (
      select 1
      from public.admin_profiles
      where user_id = auth.uid()
        and role = 'admin'
        and ativo = true
    )
  );

create policy "Admin exclui imagens de artes prontas"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'artes-modelos'
    and exists (
      select 1
      from public.admin_profiles
      where user_id = auth.uid()
        and role = 'admin'
        and ativo = true
    )
  );
