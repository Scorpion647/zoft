-- Trigger to create a profile table when a user is created
CREATE OR REPLACE FUNCTION Access.after_user_created( ) RETURNS TRIGGER
AS $$
DECLARE
  _username    VARCHAR(255);
  _domain      VARCHAR(255);
  _role        VARCHAR(40) DEFAULT 'guest';
  _supplier_id INTEGER;
  _profile_id  Uuid;
BEGIN
  _username := new.Raw_User_Meta_Data ->> 'username';

  _domain := SUBSTRING( new.Email FROM '(?<=@)[^ ]+' );

  IF ( _username = '' OR _username IS NULL )
    THEN
      _username := SUBSTRING( new.Email FROM '(^[^@]+)' );
  END IF;

  INSERT INTO Public.Profile (User_Id, Full_Name, Email, Role)
  VALUES (new.Id, _username, new.Email, _role)
  RETURNING User_Id INTO _profile_id;

  _supplier_id := (SELECT s.Id FROM Public.Supplier s WHERE s.Domain = _domain);

  IF ( _supplier_id IS NOT NULL )
    THEN
      _role := 'employee';
      INSERT INTO Public.Supplier_Employee (User_Id, Supplier_Id) VALUES (_profile_id, _supplier_id);
  END IF;

  IF _profile_id IS NULL
    THEN
      IF NOT EXISTS (SELECT 1 FROM Access.User_Role WHERE Name = _role)
        THEN
          RAISE EXCEPTION 'Could not add role [%] to user [%]', _role, _username;
      END IF;
  END IF;
  RETURN new;
END $$
  LANGUAGE Plpgsql SECURITY DEFINER;

CREATE TRIGGER after_user_created
  AFTER INSERT
  ON Auth.Users
  FOR EACH ROW
EXECUTE PROCEDURE Access.After_User_Created( );


-- Trigger to update the profile table when a user is updated
CREATE OR REPLACE FUNCTION Access.after_user_updated( ) RETURNS TRIGGER
AS $$
DECLARE
  _username     VARCHAR(255);
  _domain       VARCHAR(255);
  _old_username VARCHAR(255);
  _profile_id   Uuid;
BEGIN
  _domain := SUBSTRING( new.Email FROM '(?<=@)[^ ]+' );

  SELECT p.Full_Name FROM Public.Profile p WHERE p.User_Id = old.Id INTO _old_username;

  _username := new.Raw_User_Meta_Data ->> 'username';

  _username := CASE WHEN _username is not null and _username <> _old_username THEN _username ELSE _old_username END;

  UPDATE Public.Profile
  SET Full_Name = _username,
      Email     = new.Email
  WHERE User_Id = new.Id
  RETURNING User_Id INTO _profile_id;

  IF _profile_id IS NULL
    THEN
      RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN new;
END $$
  LANGUAGE Plpgsql SECURITY DEFINER;


CREATE TRIGGER after_user_updated
  AFTER UPDATE
  ON Auth.Users
  FOR EACH ROW
EXECUTE PROCEDURE Access.After_User_Updated( );