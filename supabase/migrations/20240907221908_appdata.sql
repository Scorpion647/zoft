create type app_options as enum ('trm_usd', 'trm_eur');

create table public.appdata
(
    key        app_options primary key                not null,
    value      jsonb                                  not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

alter table public.appdata
    enable row level security;

create policy "Select for appdata" on public.appdata for select to authenticated using (
    public.role_has_permission('appdata', B'0001')
    );
create policy "Insert for appdata" on public.appdata for insert to authenticated with check (
    public.role_has_permission('appdata', B'0010')
    );
create policy "Update for appdata" on public.appdata for update to authenticated using (
    public.role_has_permission('appdata', B'0100')
    );
create policy "Delete for appdata" on public.appdata for delete to authenticated using (
    public.role_has_permission('appdata', B'1000')
    );

insert into
    access.table_names ( name )
values
    ( 'appdata' );

insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'appdata', 'administrator', B'1111' );

insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'appdata', 'employee', B'0001' );

create function public.after_appdata_update() returns trigger as
$$
begin
    new.updated_at := now();
    return new;
end;
$$ language plpgsql security definer;

create trigger after_update_appdata
    after update
    on public.appdata
    for each row
execute procedure public.after_appdata_update();
