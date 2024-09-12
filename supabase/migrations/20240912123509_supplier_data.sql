create table public.supplier_data (
  supplier_data_id uuid default auth.uid(),
  base_bill_id       uuid  not null,
  bill_number        VARCHAR(50)          NOT NULL,
  trm                DECIMAL              NOT NULL,
  billed_quantity    INTEGER              NOT NULL,
  billed_unit_price  BIGINT               NOT NULL,
  billed_total_price BIGINT               NOT NULL,
  gross_weight       DECIMAL               NOT NULL,
  packages           DECIMAL              NOT NULL,
  supplier_employee_id int4,
  created_at         TIMESTAMP WITH TIME ZONE      DEFAULT NOW( ) NOT NULL,
  modified_at        TIMESTAMP WITH TIME ZONE      DEFAULT NOW( ) NOT NULL,
  conversion           DECIMAL              NOT NULL,

  primary key (supplier_data_id),
  foreign key (base_bill_id) references public.base_bills (base_bill_id) on delete cascade on update cascade,
  foreign key (supplier_employee_id) references public.supplier_employees (supplier_employee_id) on delete set null on update cascade
)
