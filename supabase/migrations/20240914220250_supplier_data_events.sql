ALTER TABLE public.supplier_data enable ROW level security;


CREATE POLICY "can select supplier data" ON public.supplier_data FOR
SELECT
  USING (
    EXISTS (
      SELECT
        public.role_has_permission ('supplier_data', B'0001')
    )
    OR EXISTS (
      SELECT
        1
      FROM
        public.supplier_employees em
      WHERE
        em.supplier_employee_id = public.supplier_data.supplier_employee_id
        AND em.profile_id = auth.uid ()
    )
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
        public.supplier_employees em
      WHERE
        em.supplier_employee_id = public.supplier_data.supplier_employee_id
        AND em.profile_id = auth.uid ()
        AND EXISTS (
          SELECT
            1
          FROM
            public.base_bills
          WHERE
            base_bills.supplier_id = em.supplier_id
        )
    )
  );


CREATE POLICY "can update supplier data" ON public.supplier_data
FOR UPDATE
  USING (
    EXISTS (
      SELECT
        public.role_has_permission ('supplier_data', B'0100')
    )
    OR EXISTS (
      SELECT
        1
      FROM
        public.supplier_employees em
      WHERE
        em.supplier_employee_id = public.supplier_data.supplier_employee_id
        AND em.profile_id = auth.uid ()
        AND EXISTS (
          SELECT
            1
          FROM
            public.base_bills
          WHERE
            base_bills.supplier_id = em.supplier_id
        )
    )
  );


CREATE POLICY "can delete supplier data" ON public.supplier_data FOR delete USING (
  EXISTS (
    SELECT
      public.role_has_permission ('supplier_data', B'1000')
  )
  OR EXISTS (
    SELECT
      1
    FROM
      public.supplier_employees em
    WHERE
      em.supplier_employee_id = public.supplier_data.supplier_employee_id
      AND em.profile_id = auth.uid ()
      AND EXISTS (
        SELECT
          1
        FROM
          public.base_bills
        WHERE
          base_bills.supplier_id = em.supplier_id
      )
  )
);


CREATE
OR REPLACE function public.validate_supplier_data () returns trigger AS $$
declare
    _base_bill public.base_bills%rowtype;
begin
    select * into _base_bill from public.base_bills where base_bill_id = new.base_bill_id;

    if _base_bill is null then
        raise insufficient_privilege using message =
                'You are not allowed to add or modify supplier data for this base bill';
    end if;

    if (new.billed_quantity+_base_bill.approved_quantity) > _base_bill.total_quantity then
        raise data_exception using message =
                'You cannot bill more than the quantity available. Current available quantity in bill '||_base_bill.purchase_order ||': ' || (_base_bill.total_quantity-_base_bill.approved_quantity)::text ||
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
