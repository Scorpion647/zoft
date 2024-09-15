create function public.user_is(
    user_role access.user_roles default 'guest',
    user_id uuid default auth.uid()
) returns boolean as
$$
declare
    _user_role alias for user_role;
    _user_id alias for user_id;
begin
    return exists (select 1 from public.profiles p where p.profile_id = _user_id and p.user_role = _user_role);
end;
$$ language plpgsql security definer;

-- trigger when profile is inserted, if it has a domain, check if supplier exists and insert supplier employee
create function public.check_profile_domain() returns trigger as
$$
declare
    _supplier_id int default null;
begin
    if new.email ~* '@' then
        select
            s.supplier_id
        into _supplier_id
        from
            public.suppliers s
        where
            s.domain = substring(new.email from '@(.*)$');

        if found then
            insert into public.supplier_employees ( profile_id, supplier_id )
            values ( new.profile_id, _supplier_id );
        end if;
    end if;

    return new;
end;
$$ language plpgsql security definer;

create trigger check_profile_domain
    after insert
    on public.profiles
    for each row
execute procedure public.check_profile_domain();

--trigger when profile is updated, check the role of the current user to validate the new role
create or replace function public.profile_role_before_update() returns trigger as
$$
begin
    if (current_user = 'postgres') then
        return new;
    end if;

    if (not public.user_is('administrator')) then
        if (old.user_role <> new.user_role) then
            raise insufficient_privilege using message =
                    'You do not have sufficient privileges to change the role of this profile';
        end if;
    end if;

    new.updated_at := now();
    return new;
end
$$ language plpgsql security invoker;

create trigger profile_role_on_update
    after update
    on public.profiles
    for each row
execute procedure public.profile_role_before_update();