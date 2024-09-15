-- SUPPLIER TABLE
create table public.suppliers
(
    supplier_id serial                                 not null,
    name        varchar(255)                           not null,
    domain      varchar(255),
    created_at  timestamp with time zone default now() not null,

    primary key (supplier_id),
    unique (domain)
);

create function name_domain(supplier public.suppliers) returns text as
$$
select $1.name || ' ' || $1.domain;
$$ language sql immutable;


-- permissions
insert into
    access.table_names ( name )
values
    ( 'suppliers' );

insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'suppliers', 'administrator', B'1111' );


-- SUPPLIER EMPLOYEE TABLE
create table public.supplier_employees
(
    supplier_employee_id serial primary key,
    profile_id           uuid references public.profiles (
                                                          profile_id
        ) on delete cascade on update cascade                   not null,
    supplier_id          int4 references public.suppliers (
                                                           supplier_id
        ) on delete cascade on update cascade                   not null,
    created_at           timestamp with time zone default now() not null,
    unique (profile_id, supplier_id)
);

insert into
    access.table_names ( name )
values
    ( 'supplier_employees' );

insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'supplier_employees', 'administrator', B'1111' );

-- rls for supplier employees
alter table public.supplier_employees
    enable row level security;

create policy "Select for supplier employees" on public.supplier_employees for select to authenticated using (
    public.role_has_permission('supplier_employees', B'0001')
    );
create policy "Insert for supplier employees" on public.supplier_employees for insert to authenticated with check (
    public.role_has_permission('supplier_employees', B'0010')
    );
create policy "Update for supplier employees" on public.supplier_employees for update to authenticated using (
    public.role_has_permission('supplier_employees', B'0100')
    );
create policy "Delete for supplier employees" on public.supplier_employees for delete to authenticated using (
    public.role_has_permission('supplier_employees', B'1000')
    );
create policy "Employees can select" on public.supplier_employees for select to authenticated using (
    public.supplier_employees.profile_id = auth.uid()
    );


-- rls for suppliers
alter table public.suppliers
    enable row level security;

create policy "Select for suppliers" on public.suppliers for select to authenticated using (
    public.role_has_permission('suppliers', B'0001')
    );
create policy "Insert for suppliers" on public.suppliers for insert to authenticated with check (
    public.role_has_permission('suppliers', B'0010')
    );
create policy "Update for suppliers" on public.suppliers for update to authenticated using (
    public.role_has_permission('suppliers', B'0100')
    );
create policy "Delete for suppliers" on public.suppliers for delete to authenticated using (
    public.role_has_permission('suppliers', B'1000')
    );
create policy "Employees can select" on public.suppliers for select to authenticated using (
    exists (select
                1
            from
                public.supplier_employees
            where
                  supplier_employees.supplier_id = public.suppliers.supplier_id
              and supplier_employees.profile_id = auth.uid())
    );


-- trigger when supplier employee is inserted
create function public.after_supplier_employee_insert() returns trigger as
$$
declare
    old_role access.user_roles;
begin
    old_role := (select user_role from public.profiles where profiles.profile_id = new.profile_id);

    if (old_role = 'guest') then
        update public.profiles set user_role = 'employee' where profiles.profile_id = new.profile_id;
    end if;

    return new;
end;
$$ language plpgsql security definer;

create trigger after_supplier_employee_insert
    after insert
    on public.supplier_employees
    for each row
execute procedure public.after_supplier_employee_insert();

-- trigger when supplier employee is removed
create function public.after_supplier_employee_delete() returns trigger as
$$
declare
    _old_profile public.profiles%rowtype;
begin
    select * into _old_profile from public.profiles where profiles.profile_id = old.profile_id;
    if (_old_profile.user_role <> 'administrator') then
        if (select count(*) from public.supplier_employees where supplier_employees.profile_id = old.profile_id) =
           0 then
            update public.profiles set user_role = 'guest' where profiles.profile_id = old.profile_id;
        end if;
    end if;

    return new;
end;
$$ language plpgsql security definer;

create trigger after_supplier_employee_delete
    after delete
    on public.supplier_employees
    for each row
execute procedure public.after_supplier_employee_delete();

create function public.after_supplier_employee_update() returns trigger as
$$
declare
    _old_profile public.profiles%rowtype;
    _new_profile public.profiles%rowtype;
begin
    if (old.profile_id <> new.profile_id) then
        if (select count(*) from public.supplier_employees where supplier_employees.profile_id = old.profile_id) =
           0 then
            select * into _old_profile from public.profiles where profiles.profile_id = old.profile_id;

            if (_old_profile.user_role <> 'administrator') then
                update public.profiles set user_role = 'guest' where profiles.profile_id = old.profile_id;
            end if;
        end if;

        select * into _new_profile from public.profiles where profiles.profile_id = new.profile_id;

        if (_new_profile.user_role = 'guest') then
            update public.profiles set user_role = 'employee' where profiles.profile_id = new.profile_id;
        end if;
    end if;

    return new;
end;
$$ language plpgsql security definer;

create trigger after_supplier_employee_update
    after update
    on public.supplier_employees
    for each row
execute procedure public.after_supplier_employee_update();
