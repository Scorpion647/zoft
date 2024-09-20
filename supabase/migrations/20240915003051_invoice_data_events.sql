ALTER TABLE public.invoice_data enable ROW level security;


INSERT INTO
  access.table_names (name)
VALUES
  ('invoice_data');


INSERT INTO
  access.table_permissions (table_name, user_role, permissions)
VALUES
  ('invoice_data', 'administrator', B'1111');


-- TODO: Validar mejor esto
INSERT INTO
  access.table_permissions (table_name, user_role, permissions)
VALUES
  ('invoice_data', 'employee', B'1111');


CREATE POLICY "select for invoice data" ON public.invoice_data FOR
SELECT
  USING (
    public.role_has_permission ('invoice_data', B'0001')
  );


CREATE POLICY "insert for invoice data" ON public.invoice_data FOR insert
WITH
  CHECK (
    public.role_has_permission ('invoice_data', B'0010')
  );


CREATE POLICY "update for invoice data" ON public.invoice_data
FOR UPDATE
  USING (
    public.role_has_permission ('invoice_data', B'0100')
  );


CREATE POLICY "delete for invoice data" ON public.invoice_data FOR delete USING (
  public.role_has_permission ('invoice_data', B'1000')
);


CREATE FUNCTION public.after_invoice_data_update () returns trigger AS $$
begin
    new.updated_at := now();
    return new;
end;
$$ language plpgsql security definer;


CREATE TRIGGER after_update_invoice_data
AFTER
UPDATE ON public.invoice_data FOR each ROW
EXECUTE procedure public.after_invoice_data_update ();
