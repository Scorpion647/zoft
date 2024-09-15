create table public.supplier_data
(
    supplier_data_id     uuid          default gen_random_uuid(),
    base_bill_id         uuid                        not null,
    bill_number          varchar(50)                 not null,
    trm                  decimal                     not null,
    billed_quantity      integer                     not null,
    billed_unit_price    bigint                      not null,
    billed_total_price   bigint                      not null,
    gross_weight         decimal                     not null,
    packages             decimal                     not null,
    supplier_employee_id int4,
    created_by           uuid,
    invoice_id           uuid                        not null,
    created_at           timestamp
                             with
                             time zone default now() not null,
    modified_at          timestamp
                             with
                             time zone default now() not null,
    conversion_value     decimal                     not null,
    primary key (supplier_data_id),
    foreign key (invoice_id) references public.invoice_data (invoice_id) on delete cascade on update cascade,
    foreign key (base_bill_id) references public.base_bills (
                                                             base_bill_id
        ) on delete cascade on update cascade,
    foreign key (supplier_employee_id) references public.supplier_employees (
                                                                             supplier_employee_id
        ) on delete set null on update cascade,
    foreign key (created_by) references public.profiles (profile_id) on delete set null on update cascade
);

insert into
    access.table_names ( name )
values
    ( 'supplier_data' );
insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'supplier_data', 'administrator', B'1111' );
