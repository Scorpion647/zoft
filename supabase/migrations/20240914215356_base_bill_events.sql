ALTER TABLE public.base_bills enable ROW level security;


CREATE POLICY "select for base bills" ON public.base_bills FOR
SELECT
  TO authenticated USING (
    public.role_has_permission ('base_bills', B'0001')
    OR EXISTS (
      SELECT
        1
      FROM
        public.supplier_employees em
        INNER JOIN public.suppliers USING (supplier_id)
      WHERE
        em.supplier_id = public.base_bills.supplier_id
        AND em.profile_id = auth.uid ()
    )
  );


CREATE POLICY "insert for base bills" ON public.base_bills FOR insert TO authenticated
WITH
  CHECK (
    public.role_has_permission ('base_bills', B'0010')
  );


CREATE POLICY "update for base bills" ON public.base_bills
FOR UPDATE
  TO authenticated USING (
    public.role_has_permission ('base_bills', B'0100')
  );


CREATE POLICY "delete for base bills" ON public.base_bills FOR delete TO authenticated USING (
  public.role_has_permission ('base_bills', B'1000')
);
