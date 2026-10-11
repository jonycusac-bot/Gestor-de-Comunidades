-- Ejecutar después de supabase-messages.sql. Pruebas aisladas, sin mensajes reales.
-- Todo se revierte al terminar; si falla, ejecutar ROLLBACK antes de continuar.
begin;
insert into auth.users(id, email) values
 ('10000000-0000-4000-8000-000000000001', 'manager-test@example.invalid'),
 ('10000000-0000-4000-8000-000000000002', 'owner-test@example.invalid'),
 ('10000000-0000-4000-8000-000000000003', 'outsider-test@example.invalid');
insert into public.fincaflow_message_members(user_id,community_id,role,display_name,manager_id) values
 ('10000000-0000-4000-8000-000000000001','bel-air','manager','Gestor ficticio',null),
 ('10000000-0000-4000-8000-000000000002','bel-air','owner','Propietario ficticio','10000000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select public.fincaflow_start_thread('20000000-0000-4000-8000-000000000001','Asunto ficticio','Texto ficticio');
-- Reintentar no duplica la conversación ni el primer mensaje.
select public.fincaflow_start_thread('20000000-0000-4000-8000-000000000001','Asunto ficticio','Texto ficticio');
do $$ begin
 if (select count(*) from public.fincaflow_threads where id = '20000000-0000-4000-8000-000000000001') <> 1 then raise exception 'Falla creación'; end if;
 if (select count(*) from public.fincaflow_messages where thread_id = '20000000-0000-4000-8000-000000000001') <> 1 then raise exception 'Falla idempotencia'; end if;
 update public.fincaflow_threads set state = 'Resuelta' where id = '20000000-0000-4000-8000-000000000001';
 if found then raise exception 'Propietario cambia estado'; end if;
 begin
  update public.fincaflow_threads set manager_id = '10000000-0000-4000-8000-000000000003';
  raise exception 'Se permite cambiar destinatario';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.fincaflow_message_members(user_id,community_id,role,display_name) values (auth.uid(),'bel-air','manager','Intruso');
  raise exception 'Se permite autoasignar gestor';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
do $$ begin
 if exists(select 1 from public.fincaflow_threads) or exists(select 1 from public.fincaflow_messages) then raise exception 'Intruso puede leer'; end if;
 begin
  insert into public.fincaflow_messages(id,thread_id,body) values ('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001','Intrusión');
  raise exception 'Intruso puede responder';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.fincaflow_messages(id,thread_id,body) values ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Respuesta ficticia');
update public.fincaflow_threads set state = 'Resuelta' where id = '20000000-0000-4000-8000-000000000001';
do $$ begin
 if (select state from public.fincaflow_threads where id = '20000000-0000-4000-8000-000000000001') <> 'Resuelta' then raise exception 'Gestor no puede gestionar'; end if;
 if (select count(*) from public.fincaflow_messages where thread_id = '20000000-0000-4000-8000-000000000001') <> 2 then raise exception 'Falla respuesta'; end if;
 begin
  delete from public.fincaflow_messages;
  raise exception 'Se permite borrar el historial';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
 begin
  perform * from public.fincaflow_threads;
  raise exception 'Anónimo lee conversaciones';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
