ALTER TABLE public.supplier_data enable ROW level security;


CREATE FUNCTION public.can_touch_supplier_data (
  permission_value BIT DEFAULT B'0001',
  supplier_data_id UUID DEFAULT NULL
) returns BOOLEAN AS $$
declare
    _supplier_data_id alias for supplier_data_id;
begin
    if (select
            public.role_has_permission('supplier_data', permission_value)) then
        return true;
    end if;
    if (_supplier_data_id is not null and
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
    raise insufficient_privilege using message = 'You are not allowed to access or modify this supplier data';
end
$$ language plpgsql;


CREATE POLICY "can select supplier data" ON public.supplier_data FOR
SELECT
  USING (
    can_touch_supplier_data (B'0001', supplier_data_id)
  );


CREATE POLICY "can insert supplier data" ON public.supplier_data FOR insert
WITH
  CHECK (
    EXISTS (
      SELECT
        public.role_has_permission ('supplier_data', B'0010')
    )
    OR EXISTS (
      SELECT
        1
      FROM
        public.supplier_employees employee
        INNER JOIN public.suppliers supplier USING (supplier_id)
        INNER JOIN public.base_bills bill USING (supplier_id)
      WHERE
        employee.profile_id = auth.uid ()
        AND employee.supplier_employee_id = supplier_data.supplier_employee_id
        AND supplier_data.base_bill_id = bill.base_bill_id
    )
  );


CREATE POLICY "can update supplier data" ON public.supplier_data
FOR UPDATE
  USING (
    can_touch_supplier_data (B'0100', supplier_data_id)
  );


CREATE POLICY "can delete supplier data" ON public.supplier_data FOR delete USING (
  can_touch_supplier_data (B'1000', supplier_data_id)
);


CREATE FUNCTION public.validate_supplier_data () returns trigger AS $$
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


CREATE TRIGGER "before insert supplier data" before insert ON public.supplier_data FOR each ROW
EXECUTE procedure public.validate_supplier_data ();


CREATE TRIGGER "before update supplier data" before
UPDATE ON public.supplier_data FOR each ROW
EXECUTE procedure public.validate_supplier_data ();


CREATE FUNCTION public.supplier_data_after_insert () returns trigger AS $$
begin
    update public.base_bills set quantity = (quantity - new.billed_quantity) where base_bill_id = new.base_bill_id;
    return new;
end
$$ language plpgsql security definer;


CREATE TRIGGER "after insert supplier data"
AFTER insert ON public.supplier_data FOR each ROW
EXECUTE procedure public.supplier_data_after_insert ();


CREATE FUNCTION public.supplier_data_after_update () returns trigger AS $$
begin
    if (old.billed_quantity <> new.billed_quantity) then
        update public.base_bills
        set
            quantity = (quantity + old.billed_quantity - new.billed_quantity)
        where
            base_bill_id = new.base_bill_id;
    end if;
    return new;
end
$$ language plpgsql security definer;


CREATE TRIGGER "after update supplier data"
AFTER
UPDATE ON public.supplier_data FOR each ROW
EXECUTE procedure public.supplier_data_after_update ();


CREATE FUNCTION public.supplier_data_after_delete () returns trigger AS $$
begin
    update public.base_bills set quantity = (quantity + old.billed_quantity) where base_bill_id = old.base_bill_id;
end
$$ language plpgsql security definer;


CREATE TRIGGER "after delete supplier data"
AFTER delete ON public.supplier_data FOR each ROW
EXECUTE procedure public.supplier_data_after_delete ();
