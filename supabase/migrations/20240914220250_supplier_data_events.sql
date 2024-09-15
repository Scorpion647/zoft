alter table public.supplier_data
    enable row level security;

create function public.can_touch_supplier_data(
    permission_value bit default B'0001',
    supplier_data_id uuid default null
) returns boolean as
$$
declare
    _supplier_data_id alias for supplier_data_id;
begin
    if (select
            public.role_has_permission('supplier_data', permission_value)) then
        return true;
    end if;
    if (can_touch_supplier_data.supplier_data_id is not null and
        exists (select
                    1
                from
                    public.supplier_data data
                        inner join public.supplier_employees employee using (supplier_employee_id)
                where
                      data.supplier_data_id = _supplier_data_id
                  and employee.profile_id = auth.uid())) then
        return true;
    end if;
    return false;
end
$$ language plpgsql;

create policy "can select supplier data" on public.supplier_data for select using (can_touch_supplier_data(B'0001', supplier_data_id));

create policy "can insert supplier data" on public.supplier_data for insert with check (
    exists (select
                1
            from
                public.supplier_employees employee
                    inner join public.suppliers supplier using (supplier_id)
                    inner join public.base_bills bill using (supplier_id)
            where
                  employee.profile_id = auth.uid()
              and employee.supplier_employee_id = supplier_data.supplier_employee_id
              and supplier_data.base_bill_id = bill.base_bill_id)
    );

create policy "can update supplier data" on public.supplier_data for update using (can_touch_supplier_data(B'0100', supplier_data_id));

create policy "can delete supplier data" on public.supplier_data for delete using (can_touch_supplier_data(B'1000', supplier_data_id));


create function public.validate_supplier_data() returns trigger as
$$
declare
    _base_bill public.base_bills%rowtype;
begin
    select * into _base_bill from public.base_bills where base_bill_id = new.base_bill_id;

    if _base_bill is null then
        raise insufficient_privilege using message =
                'You are not allowed to add or modify supplier data for this base bill';
    end if;

    if (_base_bill.quantity - new.billed_quantity < 0) then
        raise data_exception using message =
                'You cannot bill more than the quantity available. Current quantity: ' || _base_bill.quantity::text ||
                ' Billed quantity: ' || new.billed_quantity::text;
    end if;

    return new;
end
$$ language plpgsql security invoker;

create trigger "before insert supplier data"
    before insert
    on public.supplier_data
    for each row
execute procedure public.validate_supplier_data();

create trigger "before update supplier data"
    before update
    on public.supplier_data
    for each row
execute procedure public.validate_supplier_data();

create function public.supplier_data_after_insert() returns trigger as
$$
begin
    update public.base_bills set quantity = (quantity - new.billed_quantity) where base_bill_id = new.base_bill_id;
end
$$ language plpgsql security definer;

create trigger "after insert supplier data"
    after insert
    on public.supplier_data
    for each row
execute procedure public.supplier_data_after_insert();

create function public.supplier_data_after_update() returns trigger as
$$
begin
    if (old.billed_quantity <> new.billed_quantity) then
        update public.base_bills
        set
            quantity = (quantity + old.billed_quantity - new.billed_quantity)
        where
            base_bill_id = new.base_bill_id;
    end if;
end
$$ language plpgsql security definer;

create trigger "after update supplier data"
    after update
    on public.supplier_data
    for each row
execute procedure public.supplier_data_after_update();

create function public.supplier_data_after_delete() returns trigger as
$$
begin
    update public.base_bills set quantity = (quantity + old.billed_quantity) where base_bill_id = old.base_bill_id;
end
$$ language plpgsql security definer;

create trigger "after delete supplier data"
    after delete
    on public.supplier_data
    for each row
execute procedure public.supplier_data_after_delete();