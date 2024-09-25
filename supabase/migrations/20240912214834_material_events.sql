ALTER TABLE public.materials enable ROW level security;


CREATE POLICY "Select for materials" ON public.materials FOR
SELECT
  TO authenticated USING (
    public.role_has_permission ('materials', B'0001')
    OR EXISTS (
      SELECT
        1
      FROM
        public.supplier_employees em
        INNER JOIN public.suppliers USING (supplier_id)
        INNER JOIN public.base_bills USING (supplier_id)
      WHERE
        em.profile_id = auth.uid ()
    )
  );


CREATE POLICY "Insert for materials" ON public.materials FOR insert TO authenticated
WITH
  CHECK (public.role_has_permission ('materials', B'0010'));


CREATE POLICY "Update for materials" ON public.materials
FOR UPDATE
  TO authenticated USING (public.role_has_permission ('materials', B'0100'));


CREATE POLICY "Delete for materials" ON public.materials FOR delete TO authenticated USING (public.role_has_permission ('materials', B'1000'));


CREATE FUNCTION public.before_materials_update () returns trigger AS $$
begin
    -- if the user is not an administrator, then the subheading is the only field that can be updated
    if (not public.user_is('administrator')) then
        raise insufficient_privilege using message = 'You are not allowed to update materials';
    end if;
    return new;
end;
$$ language plpgsql security definer;


CREATE TRIGGER before_materials_update before
UPDATE ON public.materials FOR each ROW
EXECUTE procedure public.before_materials_update ();
