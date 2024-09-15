create schema if not exists access authorization postgres;
revoke all on schema access from authenticated, anon, public;

create type access.user_roles as enum ('administrator', 'employee', 'guest');

create table if not exists access.table_names
(
    name varchar(40) primary key
);

create table if not exists access.table_permissions
(
    table_name  varchar(40)       not null,
    user_role   access.user_roles not null,
    permissions bit(4)            not null,

    primary key (table_name, user_role),
    foreign key (table_name) references access.table_names (name)
);
-- SELECT 0001
-- INSERT 0010
-- UPDATE 0100
-- DELETE 1000


create or replace function public.role_has_permission(
    table_name varchar,
    user_permission bit(4) = B'0001', -- SELECT AS DEFAULT
    user_role access.user_roles = null-- DEFAULT TO CURRENT USER ROLE
) returns boolean
as
$$
declare
    _permission bit(4);
    _table_name alias for table_name;
    _user_role alias for user_role;
begin
    if _user_role is null
    then
        select p.user_role into _user_role from public.profiles p where p.profile_id = auth.uid();

        if not found
        then
            raise exception 'user_not_found';
        end if;
    end if;

    select
        p.permissions
    into _permission
    from
        access.table_permissions p
    where
          p.table_name = _table_name
      and p.user_role = _user_role;

    if found
    then
        return (_permission & user_permission) = user_permission;
    else
        return false;
    end if;
end;
$$
    language plpgsql security definer
                     set search_path = public;
