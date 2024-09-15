create table public.invoice_data
(
    invoice_id       uuid          default gen_random_uuid() not null,
    supplier_id      int4                                    not null,
    created_at       timestamp
                         with
                         time zone default now()             not null,
    updated_at       timestamp
                         with
                         time zone default now()             not null,
    approved         boolean       default false             not null,
    last_modified_by uuid          default auth.uid(),

    primary key (invoice_id),
    foreign key (supplier_id) references public.suppliers (supplier_id) on delete cascade on update cascade,
    foreign key (last_modified_by) references public.profiles (
                                                               profile_id
        ) on delete set null on update cascade
)
