create type public.material_type as enum (
    'national', 'foreign', 'nationalized', 'other'
    );

create table if not exists public.materials
(
    material_code    varchar(255),
    subheading       varchar(10) check (length(subheading) = 10 or subheading is null),
    type             public.material_type,
    measurement_unit varchar(50),
    created_at       timestamp
                         with
                         time zone default now() not null,
    primary key (material_code)
);

insert into
    access.table_names ( name )
values
    ( 'materials' );
insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'materials', 'administrator', B'1111' );
insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'materials', 'employee', B'0101' );
create type public.currency as enum ('COP', 'USD', 'EUR');

create domain positive_integer as integer check (value > 0);

create table public.base_bills
(
    base_bill_id     uuid          default gen_random_uuid() not null,
    item             positive_integer                        not null,
    quantity         positive_integer                        not null default 0,
    material_code    varchar(50)                             not null,
    purchase_order   varchar(50)                             not null,
    measurement_unit varchar(50)                             not null,
    unit_price       bigint                                  not null,
    currency         public.currency                         not null,
    created_at       timestamp
                         with
                         time zone default now()             not null,
    supplier_id      integer                                 not null,
    description      varchar(50),
    net_price        bigint,
    primary key (base_bill_id),
    foreign key (supplier_id) references public.suppliers (
                                                           supplier_id
        ) on delete cascade on update cascade,
    unique (base_bill_id, purchase_order)
);

insert into
    access.table_names ( name )
values
    ( 'base_bills' );
insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'base_bills', 'administrator', B'1111' );
insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'base_bills', 'employee', B'0001' );