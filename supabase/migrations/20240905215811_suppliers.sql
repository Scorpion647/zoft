-- SUPPLIER TABLE
CREATE TABLE public.suppliers
(
    supplier_id SERIAL                                 NOT NULL,
    name        VARCHAR(255)                           NOT NULL,
    domain      VARCHAR(255),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    PRIMARY KEY (supplier_id),
    UNIQUE (domain)
);

CREATE FUNCTION name_domain(supplier public.suppliers) RETURNS text AS
$$
SELECT $1.name || ' ' || $1.domain;
$$ LANGUAGE sql IMMUTABLE;


-- permissions
INSERT INTO access.table_names (name)
VALUES ('supplier');

INSERT INTO access.table_permissions (table_name, user_role, permissions)
VALUES ('supplier', 'administrator', B'1111');


-- SUPPLIER EMPLOYEE TABLE
CREATE TABLE public.supplier_employees
(
    profile_id  uuid REFERENCES public.profiles (profile_id) ON DELETE CASCADE ON UPDATE CASCADE   NOT NULL,
    supplier_id int4 REFERENCES public.suppliers (supplier_id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()                                             NOT NULL,
    PRIMARY KEY (profile_id, supplier_id)
);

INSERT INTO access.table_names (name)
VALUES ('supplier_employee');

INSERT INTO access.table_permissions (table_name, user_role, permissions)
VALUES ('supplier_employee', 'administrator', B'1111');

-- rls for supplier employees
ALTER TABLE public.supplier_employees
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select for supplier employees" ON public.supplier_employees FOR SELECT TO authenticated USING (public.role_has_permission('supplier_employee', B'0001'));
CREATE POLICY "Insert for supplier employees" ON public.supplier_employees FOR INSERT TO authenticated WITH CHECK (public.role_has_permission('supplier_employee', B'0010'));
CREATE POLICY "Update for supplier employees" ON public.supplier_employees FOR UPDATE TO authenticated USING (public.role_has_permission('supplier_employee', B'0100'));
CREATE POLICY "Delete for supplier employees" ON public.supplier_employees FOR DELETE TO authenticated USING (public.role_has_permission('supplier_employee', B'1000'));
CREATE POLICY "Employees can select" ON public.supplier_employees FOR SELECT TO authenticated USING (public.supplier_employees.profile_id = auth.uid());


-- rls for suppliers
ALTER TABLE public.suppliers
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select for suppliers" ON public.suppliers FOR SELECT TO authenticated USING (
    public.role_has_permission('supplier', B'0001')
    );
CREATE POLICY "Insert for suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (public.role_has_permission('supplier', B'0010'));
CREATE POLICY "Update for suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (public.role_has_permission('supplier', B'0100'));
CREATE POLICY "Delete for suppliers" ON public.suppliers FOR DELETE TO authenticated USING (public.role_has_permission('supplier', B'1000'));
CREATE POLICY "Employees can select" ON public.suppliers FOR SELECT TO authenticated USING (EXISTS(SELECT 1
                                                                                                   FROM public.supplier_employees
                                                                                                   WHERE supplier_employees.supplier_id = public.suppliers.supplier_id
                                                                                                     AND supplier_employees.profile_id = auth.uid()));


-- trigger when supplier employee is inserted
create function public.after_supplier_employee_insert() returns trigger as
$$
    declare
        old_role access.user_roles;
begin
    old_role := (select user_role from public.profiles where profiles.profile_id = new.profile_id);

    if ( old_role='guest' ) then
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
      if (select count(*) from public.supplier_employees where supplier_employees.profile_id = old.profile_id) = 0 then
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
      if (select count(*) from public.supplier_employees where supplier_employees.profile_id = old.profile_id) = 0 then
        select * into _old_profile from public.profiles where profiles.profile_id = old.profile_id;

        if (_old_profile.user_role <> 'administrator') then
          update public.profiles set user_role = 'guest' where profiles.profile_id = old.profile_id;
        end if;
      end if;

      select * into _new_profile from public.profiles where profiles.profile_id = new.profile_id;

      if (_new_profile.user_role='guest') then
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
