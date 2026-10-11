-- Ejecutar una vez en SQL Editor. No modifica documentos ni juntas.
begin;
create table public.fincaflow_message_members (
  user_id uuid not null references auth.users(id),
  community_id text not null check (community_id = 'bel-air'),
  role text not null check (role in ('owner','manager')),
  display_name text not null,
  home text not null default '',
  manager_id uuid references auth.users(id),
  primary key (user_id, community_id),
  check ((role = 'owner' and manager_id is not null and manager_id <> user_id) or (role = 'manager' and manager_id is null))
);
create table public.fincaflow_threads (
  id uuid primary key default gen_random_uuid(),
  community_id text not null check (community_id = 'bel-air'),
  owner_id uuid not null references auth.users(id),
  manager_id uuid not null references auth.users(id),
  subject text not null check (length(trim(subject)) between 1 and 120),
  state text not null default 'Nueva' check (state in ('Nueva','En gestión','Resuelta')),
  created_at timestamptz not null default now(),
  check (owner_id <> manager_id)
);
create table public.fincaflow_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.fincaflow_threads(id),
  sender_id uuid not null default auth.uid() references auth.users(id),
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index on public.fincaflow_threads(community_id, created_at desc);
create index on public.fincaflow_messages(thread_id, created_at);
alter table public.fincaflow_message_members enable row level security;
alter table public.fincaflow_threads enable row level security;
alter table public.fincaflow_messages enable row level security;
revoke all on public.fincaflow_message_members, public.fincaflow_threads, public.fincaflow_messages from anon, authenticated;
grant select on public.fincaflow_message_members, public.fincaflow_threads, public.fincaflow_messages to authenticated;
grant insert (id, community_id, owner_id, manager_id, subject) on public.fincaflow_threads to authenticated;
grant update (state) on public.fincaflow_threads to authenticated;
grant insert (id, thread_id, body) on public.fincaflow_messages to authenticated;
create policy members_self on public.fincaflow_message_members for select to authenticated using (user_id = (select auth.uid()));
create policy threads_read on public.fincaflow_threads for select to authenticated using (
  exists (select 1 from public.fincaflow_message_members m where m.user_id = (select auth.uid()) and m.community_id = fincaflow_threads.community_id and
    ((m.role = 'owner' and owner_id = m.user_id and fincaflow_threads.manager_id = m.manager_id) or (m.role = 'manager' and fincaflow_threads.manager_id = m.user_id)))
);
create policy threads_create on public.fincaflow_threads for insert to authenticated with check (
  exists (select 1 from public.fincaflow_message_members m where m.user_id = (select auth.uid()) and m.role = 'owner' and m.community_id = fincaflow_threads.community_id and owner_id = m.user_id and fincaflow_threads.manager_id = m.manager_id)
);
create policy threads_state on public.fincaflow_threads for update to authenticated using (
  manager_id = (select auth.uid()) and exists (select 1 from public.fincaflow_message_members m where m.user_id = (select auth.uid()) and m.community_id = fincaflow_threads.community_id and m.role = 'manager')
) with check (manager_id = (select auth.uid()));
create policy messages_read on public.fincaflow_messages for select to authenticated using (exists (select 1 from public.fincaflow_threads t where t.id = thread_id));
create policy messages_send on public.fincaflow_messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists (select 1 from public.fincaflow_threads t where t.id = thread_id));
-- Creación atómica e idempotente mediante ID suministrado por el cliente.
create function public.fincaflow_start_thread(thread_id uuid, title text, body text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare membership public.fincaflow_message_members; result uuid;
begin
  select * into strict membership from public.fincaflow_message_members where user_id = auth.uid() and role = 'owner' and community_id = 'bel-air';
  select id into result from public.fincaflow_threads where id = thread_id and owner_id = auth.uid();
  if result is not null then return result; end if;
  insert into public.fincaflow_threads(id, community_id, owner_id, manager_id, subject) values (thread_id, membership.community_id, auth.uid(), membership.manager_id, title);
  insert into public.fincaflow_messages(id, thread_id, body) values (thread_id, thread_id, body);
  return thread_id;
end; $$;
revoke all on function public.fincaflow_start_thread(uuid,text,text) from public, anon;
grant execute on function public.fincaflow_start_thread(uuid,text,text) to authenticated;
commit;

-- Dar acceso SOLO desde SQL Editor tras identificar las dos cuentas de Auth.
-- Sustituir UUID y vivienda; no ejecutar los ejemplos literalmente.
-- insert into public.fincaflow_message_members(user_id, community_id, role, display_name)
-- values ('UUID_GESTOR', 'bel-air', 'manager', 'Administración');
-- insert into public.fincaflow_message_members(user_id, community_id, role, display_name, home, manager_id)
-- values ('UUID_PROPIETARIO', 'bel-air', 'owner', 'Propietario de prueba', 'VIVIENDA', 'UUID_GESTOR');
