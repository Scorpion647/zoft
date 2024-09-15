alter table public.base_bills
    enable row level security;

create policy "select for base bills" on public.base_bills for select to authenticated using (
    public.role_has_permission('base_bills', B'0001')
        or exists (select
                       1
                   from
                       public.supplier_employees em
                           inner join public.suppliers using (supplier_id)
                   where
                       em.supplier_id = public.base_bills.supplier_id and
                       em.profile_id = auth.uid())
    );

create policy "insert for base bills" on public.base_bills for insert to authenticated with check (
    public.role_has_permission('base_bills', B'0010')
    );

create policy "update for base bills" on public.base_bills for update to authenticated using (
    public.role_has_permission('base_bills', B'0100')
    );

create policy "delete for base bills" on public.base_bills for delete to authenticated using (
    public.role_has_permission('base_bills', B'1000')
    );