CREATE OR REPLACE FUNCTION before_insert_record( ) RETURNS TRIGGER
  LANGUAGE Plpgsql
AS $$
BEGIN
  IF ( new.Net_Price IS NULL )
    THEN
      new.Net_Price := new.Unit_Price * new.Quantity;
  END IF;
  RETURN new;
END; $$;

CREATE OR REPLACE FUNCTION before_update_record( ) RETURNS TRIGGER
  LANGUAGE Plpgsql
AS $$
BEGIN
  IF ( new.Net_Price IS NULL )
    THEN
      new.Net_Price := new.Unit_Price * new.Quantity;
  END IF;
END; $$;

CREATE TRIGGER before_insert_record
  BEFORE INSERT
  ON Public.Record
  FOR EACH ROW
EXECUTE PROCEDURE before_insert_record( );

CREATE TRIGGER before_update_record
  BEFORE UPDATE
  ON Public.Record
  FOR EACH ROW
EXECUTE PROCEDURE before_update_record( );