CREATE TABLE public.supplier_data (
  supplier_data_id UUID DEFAULT gen_random_uuid (),
  base_bill_id UUID NOT NULL,
  bill_number VARCHAR(50) NOT NULL,
  trm DECIMAL NOT NULL,
  billed_quantity INTEGER NOT NULL,
  billed_unit_price BIGINT NOT NULL,
  billed_total_price BIGINT NOT NULL,
  gross_weight DECIMAL NOT NULL,
  packages DECIMAL NOT NULL,
  supplier_employee_id int4,
  created_by UUID,
  invoice_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  conversion_value DECIMAL NOT NULL,
  PRIMARY KEY (supplier_data_id),
  FOREIGN key (invoice_id) REFERENCES public.invoice_data (invoice_id) ON DELETE cascade ON UPDATE cascade,
  FOREIGN key (base_bill_id) REFERENCES public.base_bills (base_bill_id) ON DELETE cascade ON UPDATE cascade,
  FOREIGN key (supplier_employee_id) REFERENCES public.supplier_employees (supplier_employee_id) ON DELETE SET NULL ON UPDATE cascade,
  FOREIGN key (created_by) REFERENCES public.profiles (profile_id) ON DELETE SET NULL ON UPDATE cascade
);


CREATE FUNCTION supplier_data_search (public.supplier_data) returns TEXT AS $$
  select
              $1.bill_number || ' '
             || $1.trm || ' '
             || $1.billed_quantity || ' '
             || $1.billed_unit_price || ' '
             || $1.billed_total_price || ' '
             || $1.gross_weight || ' '
             || $1.packages || ' '
             || $1.supplier_employee_id || ' '
             || $1.created_by || ' '
             || $1.invoice_id || ' '
             || $1.created_at || ' '
             || $1.modified_at || ' '
             || $1.conversion_value;
$$ language sql immutable;


INSERT INTO
  access.table_names (name)
VALUES
  ('supplier_data');


INSERT INTO
  access.table_permissions (table_name, user_role, permissions)
VALUES
  ('supplier_data', 'administrator', B'1111');
