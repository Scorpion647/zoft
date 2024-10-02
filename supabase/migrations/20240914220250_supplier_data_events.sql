ALTER TABLE public.supplier_data enable ROW level security;


CREATE POLICY "can select supplier data" ON public.supplier_data FOR
SELECT
  USING (
    public.role_has_permission ('supplier_data', B'0001')
    OR EXISTS (
      SELECT
        1
      FROM
        public.base_bills
      WHERE
        base_bills.base_bill_id = supplier_data.base_bill_id
    )
  );


CREATE POLICY "can insert supplier data" ON public.supplier_data FOR insert
WITH
  CHECK (
    public.role_has_permission ('supplier_data', B'0010')
    OR EXISTS (
      SELECT
        1
      FROM
        public.base_bills
      WHERE
        base_bills.base_bill_id = supplier_data.base_bill_id
    )
  );


CREATE POLICY "can update supplier data" ON public.supplier_data
FOR UPDATE
  USING (
    public.role_has_permission ('supplier_data', B'0100')
    OR EXISTS (
      SELECT
        1
      FROM
        public.base_bills
      WHERE
        base_bills.base_bill_id = supplier_data.base_bill_id
    )
  );


CREATE POLICY "can delete supplier data" ON public.supplier_data FOR delete USING (
  public.role_has_permission ('supplier_data', B'1000')
  OR EXISTS (
    SELECT
      1
    FROM
      public.base_bills
    WHERE
      base_bills.base_bill_id = supplier_data.base_bill_id
  )
);


CREATE
OR REPLACE function public.validate_supplier_data () returns trigger AS $$
declare
    _base_bill public.base_bills%rowtype;
    _invoice public.invoice_data%rowtype;
    _available_quantity numeric;
begin
    select * into _base_bill from public.base_bills where base_bill_id = new.base_bill_id;
    select * into _invoice from public.invoice_data where invoice_id = new.invoice_id;

    if (_invoice is null) then
        raise insufficient_privilege using message =
                'The selected invoice does not exist or you do not have enough privileges to access it';
    end if;

    if (_base_bill is null) then
        raise insufficient_privilege using message =
                'The selected base bill does not exist or you do not have enough privileges to access it';
    end if;

    if (_base_bill.supplier_id <> _invoice.supplier_id) then
        raise insufficient_privilege using message =
                'The base bill and the invoice do not belong to the same supplier';
    end if;

    _available_quantity := _base_bill.total_quantity;

    if (_invoice.state='pending') then
        _available_quantity := _available_quantity - ((_base_bill.pending_quantity - coalesce(old.billed_quantity, 0))+ _base_bill.approved_quantity);
    elseif (_invoice.state='approved') then
        _available_quantity := _available_quantity - ((_base_bill.approved_quantity - coalesce(old.billed_quantity, 0))+ _base_bill.pending_quantity);
    end if;

    if (new.billed_quantity > _available_quantity) then
        raise data_exception using message =
                'You cannot bill more than the quantity available. Current available quantity in bill '||_base_bill.purchase_order ||': ' || _available_quantity::text ||
                ' Billed quantity: ' || new.billed_quantity::text;
    elseif (new.billed_quantity < 0) then
        raise data_exception using message =
                'You cannot bill a negative quantity';
    else
        if (_invoice.state='approved') then
            if (user_is('administrator')) then
                update public.base_bills
                set approved_quantity=approved_quantity+new.billed_quantity - coalesce(old.billed_quantity, 0)
                where base_bills.base_bill_id = new.base_bill_id;
            else
                update public.invoice_data set state = 'pending' where invoice_id = new.invoice_id;
                select * into _invoice from public.invoice_data where invoice_id = new.invoice_id;
            end if;
        end if;

        if (_invoice.state='pending') then
            update public.base_bills
            set pending_quantity=pending_quantity+new.billed_quantity-coalesce(old.billed_quantity, 0)
            where base_bills.base_bill_id = new.base_bill_id;
        end if;
    end if;

    return new;
end
$$ language plpgsql security invoker;


CREATE TRIGGER "before insert supplier data" before insert ON public.supplier_data FOR each ROW
EXECUTE procedure public.validate_supplier_data ();


CREATE TRIGGER "before update supplier data" before
UPDATE ON public.supplier_data FOR each ROW
EXECUTE procedure public.validate_supplier_data ();
