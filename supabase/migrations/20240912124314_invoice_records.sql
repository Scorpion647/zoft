create table public.invoice_records (
  invoice_id uuid default uuid_generate_v4() not null,
  supplier_employee_id int4,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  approved boolean default false not null,
  last_modified_by uuid default uuid_generate_v4(),

  foreign key (supplier_employee_id) references public.supplier_employees (supplier_employee_id) on delete set null on update cascade,
  foreign key (last_modified_by) references public.profiles (profile_id) on delete set null on update cascade
)
