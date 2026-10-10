-- Demo privada: cada cuenta accede únicamente a sus propios documentos y juntas.
begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fincaflow-private', 'fincaflow-private', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;
create table if not exists public.fincaflow_files (
  owner_id uuid not null default auth.uid() references auth.users(id),
  community_id text not null,
  kind text not null check (kind in ('documents', 'meetings')),
  id uuid not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner_id, community_id, kind, id)
);
alter table public.fincaflow_files enable row level security;
grant select, insert, update on public.fincaflow_files to authenticated;
create policy "fincaflow_records_read" on public.fincaflow_files for select to authenticated using (owner_id = auth.uid());
create policy "fincaflow_records_insert" on public.fincaflow_files for insert to authenticated with check (owner_id = auth.uid());
create policy "fincaflow_records_update" on public.fincaflow_files for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "fincaflow_pdf_read" on storage.objects for select to authenticated using (bucket_id = 'fincaflow-private' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fincaflow_pdf_insert" on storage.objects for insert to authenticated with check (bucket_id = 'fincaflow-private' and (storage.foldername(name))[1] = auth.uid()::text);
commit;
