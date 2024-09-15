alter table public.materials
    enable row level security;

create policy "Select for materials"
    on public.materials for select
    to authenticated using (
    public.role_has_permission('materials', B'0001')
        or exists (select
                       1
                   from
                       public.supplier_employees em
                           inner join public.suppliers using (supplier_id)
                           inner join public.base_bills using (supplier_id)
                   where
                       em.profile_id = auth.uid())
    );

create policy "Insert for materials" on public.materials for insert to authenticated
    with
    check (
    public.role_has_permission('materials', B'0010')
    );

create policy "Update for materials" on public.materials for
    update to authenticated using (
    public.role_has_permission('materials', B'0100')
    );

create policy "Delete for materials" on public.materials for delete to authenticated using (
    public.role_has_permission('materials', B'1000')
    );

create function public.before_materials_update() returns trigger as
$$
begin
    -- if the user is not an administrator, then the subheading is the only field that can be updated
    if (!public.user_is('administrator')) then
        new.material_code := old.material_code;
        new.created_at := old.created_at;
        new.type := old.type;
        new.measurement_unit := old.measurement_unit;
    end if;
    return new;
end;
$$ language plpgsql security definer;

create trigger before_materials_update
    before update
    on public.materials
    for each row
execute procedure public.before_materials_update();