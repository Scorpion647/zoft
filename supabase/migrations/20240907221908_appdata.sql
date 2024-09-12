CREATE TYPE app_options AS enum ('trm_usd', 'trm_eur');

CREATE TABLE public.appdata
(
    key        app_options PRIMARY KEY                NOT NULL,
    value      jsonb                                  NOT NULL,
    created_at timestamp with time zone DEFAULT NOW() NOT NULL,
    updated_at timestamp with time zone DEFAULT NOW() NOT NULL
);

ALTER TABLE public.appdata
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select for appdata" ON public.appdata FOR SELECT TO authenticated USING (public.role_has_permission('appdata', B'0001'));
CREATE POLICY "Insert for appdata" ON public.appdata FOR INSERT TO authenticated WITH CHECK (public.role_has_permission('appdata', B'0010'));
CREATE POLICY "Update for appdata" ON public.appdata FOR UPDATE TO authenticated USING (public.role_has_permission('appdata', B'0100'));
CREATE POLICY "Delete for appdata" ON public.appdata FOR DELETE TO authenticated USING (public.role_has_permission('appdata', B'1000'));

INSERT INTO access.table_names (name)
VALUES ('appdata');

INSERT INTO access.table_permissions (table_name, user_role, permissions)
VALUES ('appdata', 'administrator', B'1111');

insert into access.table_permissions (table_name, user_role, permissions)
values ('appdata', 'employee', B'0001');

CREATE FUNCTION public.after_appdata_update() RETURNS trigger AS
$$
BEGIN
    new.updated_at := NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_update_appdata
    AFTER UPDATE
    ON public.appdata
    FOR EACH ROW
EXECUTE PROCEDURE public.after_appdata_update();
