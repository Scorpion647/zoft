DROP TABLE IF EXISTS Table_Permission;
DROP TABLE IF EXISTS User_Role;
DROP TABLE IF EXISTS Table_Name;
DROP TABLE IF EXISTS Public.Profile;

CREATE SCHEMA IF NOT EXISTS Access AUTHORIZATION Postgres;
REVOKE ALL ON SCHEMA Access FROM Authenticated, Anon, PUBLIC;

-- ROLE MANAGEMENT
CREATE TABLE IF NOT EXISTS Access.User_Role (
  name VARCHAR(50),
  PRIMARY KEY ( name )
);
INSERT INTO Access.User_Role (Name)
VALUES ('administrator'),
       ('employee'),
       ('guest');

CREATE TABLE IF NOT EXISTS Access.Table_Name (
  name VARCHAR(40),

  PRIMARY KEY ( name )
);

INSERT INTO Access.Table_Name (Name)
VALUES ('profile');

CREATE TABLE IF NOT EXISTS Access.table_permission (
  table_name  VARCHAR(40),
  user_role   VARCHAR(40),
  permissions BIT(4),

  PRIMARY KEY ( table_name, user_role ),
  FOREIGN KEY ( table_name ) REFERENCES Access.Table_Name ( Name ),
  FOREIGN KEY ( user_role ) REFERENCES Access.User_Role ( Name )
);
-- SELECT 0001
-- INSERT 0010
-- UPDATE 0100
-- DELETE 1000

INSERT INTO Access.Table_Permission (Table_Name, User_Role, Permissions)
VALUES ('profile', 'administrator', B'1111');

INSERT INTO Access.Table_Permission (Table_Name, User_Role, Permissions)
VALUES ('profile', 'employee', B'0001' | B'0100');
-- SELECT, UPDATE

-- PROFILE TABLE
CREATE TABLE IF NOT EXISTS Public.Profile (
  user_id    Uuid,
  full_name  VARCHAR(255),
  email      VARCHAR(255),
  role       VARCHAR(40)              DEFAULT 'guest',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW( ) NOT NULL,

  PRIMARY KEY ( user_id ),
  FOREIGN KEY ( role ) REFERENCES Access.User_Role ( Name ) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE OR REPLACE FUNCTION Public.role_has_permission(
  table_name      VARCHAR(40),
  user_permission BIT(4)=B'0001', -- SELECT AS DEFAULT
  user_role       VARCHAR(40)=NULL-- DEFAULT TO CURRENT USER ROLE
) RETURNS BOOLEAN
AS $$
DECLARE
  _permission BIT(4);
  _table_name ALIAS FOR table_name;
  _user_role ALIAS FOR user_role;
BEGIN
  IF user_role IS NULL
    THEN
      SELECT p.Role INTO _user_role FROM Public.Profile p WHERE p.User_Id = Auth.Uid( );

      IF NOT FOUND
        THEN
          RAISE EXCEPTION 'user_not_found';
      END IF;
  END IF;

  SELECT p.Permissions
  INTO _permission
  FROM Access.Table_Permission p
  WHERE p.Table_Name = _table_name
    AND p.User_Role = _user_role;

  IF FOUND
    THEN
      RETURN ( _permission & user_permission ) = user_permission;
    ELSE
      RETURN FALSE;
  END IF;
END; $$
  LANGUAGE Plpgsql SECURITY DEFINER SET search_path = Public;