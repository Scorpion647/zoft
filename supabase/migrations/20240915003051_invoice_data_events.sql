alter table public.invoice_data
    enable row level security;

insert into
    access.table_names ( name )
values
    ( 'invoice_data' );

insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'invoice_data', 'administrator', B'1111' );

insert into
    access.table_permissions ( table_name, user_role, permissions )
values
    ( 'invoice_data', 'employee', B'1111' );

create policy "select for invoice data" on public.invoice_data
    for select using (
    public.role_has_permission('invoice_data', B'0001'));

create policy "insert for invoice data" on public.invoice_data
    for insert with check (
    public.role_has_permission('invoice_data', B'0010'));

create policy "update for invoice data" on public.invoice_data
    for update using (
    public.role_has_permission('invoice_data', B'0100'));

create policy "delete for invoice data" on public.invoice_data
    for delete using (
    public.role_has_permission('invoice_data', B'1000'));


create function public.after_invoice_data_update() returns trigger as
$$
begin
    new.updated_at := now();
    return new;
end;
$$ language plpgsql security definer;

create trigger after_update_invoice_data
    after update
    on public.invoice_data
    for each row
execute procedure public.after_invoice_data_update();
