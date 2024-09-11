-- PROFILE TABLE
CREATE TABLE public.profiles
(
    profile_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    full_name  varchar(255)             DEFAULT NULL,
    user_role  access.user_roles        DEFAULT 'guest',
    email      varchar(255)             DEFAULT NULL CHECK (email ~* '^.+@.+\..+$'),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

ALTER TABLE public.profiles
    ENABLE ROW LEVEL SECURITY;

INSERT INTO access.table_names (name)
VALUES ('profile');

INSERT INTO access.table_permissions (table_name, user_role, permissions)
VALUES ('profile', 'administrator', B'1111');

INSERT INTO access.table_permissions (table_name, user_role, permissions)
VALUES ('profile', 'employee', B'0001' | B'0100');

-- TRIGGER WHEN USER IS INSERTED
CREATE FUNCTION public.on_user_insert() RETURNS trigger AS
$$
DECLARE
    _username varchar(255);
BEGIN
    _username := new.raw_user_meta_data ->> 'username';

    INSERT INTO public.profiles (profile_id, full_name, email, created_at, updated_at)
    VALUES (new.id, _username, new.email, new.created_at, new.updated_at);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_insert
    AFTER INSERT
    ON auth.users
    FOR EACH ROW
EXECUTE PROCEDURE public.on_user_insert();

-- TRIGGER WHEN USER IS UPDATED
CREATE FUNCTION public.after_user_update() RETURNS trigger AS
$$
DECLARE
    _username varchar(255) DEFAULT NULL;
BEGIN
    _username := new.raw_user_meta_data ->> 'username';

    UPDATE public.profiles
    SET full_name  = COALESCE(_username, full_name),
        email      = new.email,
        updated_at = new.updated_at
    WHERE profiles.profile_id = new.id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_user_update
    AFTER UPDATE
    ON auth.users
    FOR EACH ROW
EXECUTE PROCEDURE public.after_user_update();

-- TRIGGER WHEN USER IS DELETED
CREATE FUNCTION public.after_profile_delete() RETURNS trigger AS
$$
BEGIN
    DELETE FROM auth.users WHERE auth.users.id = old.profile_id;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_profile_delete
    AFTER DELETE
    ON public.profiles
    FOR EACH ROW
EXECUTE PROCEDURE public.after_profile_delete();

CREATE POLICY "Select for profiles" ON public.profiles FOR SELECT TO authenticated USING (public.role_has_permission('profile', B'0001'));
CREATE POLICY "Insert for profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.role_has_permission('profile', B'0010'));
CREATE POLICY "Update for profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.role_has_permission('profile', B'0100'));
CREATE POLICY "Delete for profiles" ON public.profiles FOR DELETE TO authenticated USING (
    profile_id = auth.uid()
        OR
    public.role_has_permission('profile', B'1000')
    );
