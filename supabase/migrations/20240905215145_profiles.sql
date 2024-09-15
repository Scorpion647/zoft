-- PROFILE TABLE

create extension citext with schema extensions;

create domain domain_email as extensions.citext
    check (
        true
        );
create table public.profiles
(
    profile_id uuid primary key references auth.users (id) on delete cascade,
    full_name  varchar(255)             default null,
    user_role  access.user_roles        default 'guest',
    email      domain_email             default null unique,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

alter table public.profiles
    enable row level security;

insert into
    access.table_names ( name )
values
    ( 'profiles' );

insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'profiles', 'administrator', B'1111' );

insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'profiles', 'employee', B'0001' | B'0100' );

-- TRIGGER WHEN USER IS INSERTED
create function public.on_user_insert() returns trigger as
$$
declare
    _username varchar(255);
begin
    _username := new.raw_user_meta_data ->> 'username';

    insert into
        public.profiles ( profile_id, full_name, email, created_at, updated_at )
    values ( new.id, _username, new.email, new.created_at, new.updated_at );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_user_insert
    after insert
    on auth.users
    for each row
execute procedure public.on_user_insert();

-- TRIGGER WHEN USER IS UPDATED
create function public.after_user_update() returns trigger as
$$
declare
    _username varchar(255) default null;
begin
    _username := new.raw_user_meta_data ->> 'username';

    update public.profiles
    set
        full_name  = coalesce(_username, full_name),
        email      = new.email,
        updated_at = new.updated_at
    where
        profiles.profile_id = new.id;

    return new;
end;
$$ language plpgsql security definer;

create trigger after_user_update
    after update
    on auth.users
    for each row
execute procedure public.after_user_update();

-- TRIGGER WHEN USER IS DELETED
create function public.after_profile_delete() returns trigger as
$$
begin
    delete from auth.users where auth.users.id = old.profile_id;
    return new;
end;
$$ language plpgsql security definer;

create trigger after_profile_delete
    after delete
    on public.profiles
    for each row
execute procedure public.after_profile_delete();

create policy "Select for profiles" on public.profiles for select to authenticated using (
    true
    );
create policy "Insert for profiles" on public.profiles for insert to authenticated with check (
    public.role_has_permission('profiles', B'0010')
    );
create policy "Update for profiles" on public.profiles for update to authenticated using (
    public.role_has_permission('profiles', B'0100')
    );
create policy "Delete for profiles" on public.profiles for delete to authenticated using (
    profile_id = auth.uid()
        or
    public.role_has_permission('profiles', B'1000')
    );
