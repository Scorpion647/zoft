CREATE SCHEMA IF NOT EXISTS access AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA access FROM authenticated, anon, PUBLIC;

CREATE TYPE access.user_roles AS ENUM ('administrator', 'employee', 'guest');

CREATE TABLE IF NOT EXISTS access.table_names
(
    name VARCHAR(40) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS access.table_permissions
(
    table_name  VARCHAR(40)       NOT NULL,
    user_role   access.user_roles NOT NULL,
    permissions BIT(4)            NOT NULL,

    PRIMARY KEY (table_name, user_role),
    FOREIGN KEY (table_name) REFERENCES access.table_names (name)
);
-- SELECT 0001
-- INSERT 0010
-- UPDATE 0100
-- DELETE 1000


CREATE OR REPLACE FUNCTION public.role_has_permission(
    table_name VARCHAR,
    user_permission BIT(4)=B'0001', -- SELECT AS DEFAULT
    user_role access.user_roles=NULL-- DEFAULT TO CURRENT USER ROLE
) RETURNS BOOLEAN
AS
$$
DECLARE
    _permission BIT(4);
    _table_name ALIAS FOR table_name;
    _user_role ALIAS FOR user_role;
BEGIN
    IF _user_role IS NULL
    THEN
        SELECT p.user_role INTO _user_role FROM public.profiles p WHERE p.profile_id = auth.uid();

        IF NOT found
        THEN
            RAISE EXCEPTION 'user_not_found';
        END IF;
    END IF;

    SELECT p.permissions
    INTO _permission
    FROM access.table_permissions p
    WHERE p.table_name = _table_name
      AND p.user_role = _user_role;

    IF found
    THEN
        RETURN (_permission & user_permission) = user_permission;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$
    LANGUAGE plpgsql SECURITY DEFINER
                     SET search_path = public;
