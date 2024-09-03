CREATE OR REPLACE FUNCTION Access.insert_test_user(
  user_email   TEXT,
  user_name    TEXT DEFAULT '',
  user_id      Uuid DEFAULT Extensions.Uuid_Generate_V4( ),
  user_role    TEXT DEFAULT 'authenticated',
  profile_role TEXT DEFAULT NULL
) RETURNS VOID
AS $$
DECLARE
  _user_id ALIAS FOR user_id;
BEGIN
  INSERT INTO Auth.Users (Id,
                          Aud,
                          Role,
                          Email,
                          Encrypted_Password,
                          Email_Confirmed_At,
                          Raw_App_Meta_Data,
                          Created_At, Raw_User_Meta_Data)
  VALUES (_user_id,
          user_role,
          user_role,
          user_email,
          Extensions.Crypt( 'Password123', Extensions.Gen_Salt( 'bf' ) ),
          NOW( ),
          JSONB_BUILD_OBJECT( 'provider', 'email', 'providers', JSONB_BUILD_ARRAY( 'email' ) ),
          NOW( ), JSONB_BUILD_OBJECT( 'username', user_name ));

  IF FOUND AND profile_role IS NOT NULL
    THEN
      UPDATE Public.Profile p
      SET Role = ( CASE WHEN ( p.Role IS DISTINCT FROM profile_role ) THEN profile_role ELSE p.Role END )
      WHERE p.User_Id = _user_id;
  END IF;
END; $$
  LANGUAGE Plpgsql SECURITY INVOKER;


DO $$
  DECLARE
    --Profiles
    _profile_role              VARCHAR(40);
    _user_name                 VARCHAR(255);
    _user_email                TEXT;
    _domains                   TEXT[];
    _supplier_id               INTEGER;
    _supplier_ids              INTEGER[];
    _domain_number             INT := 3;
    _users_id                  Uuid[];
    _user_id                   Uuid;

    --materials
    _material_code             VARCHAR(50);
    _subheading                VARCHAR(10);
    _type                      public.Material_Type;
    _material_measurement_unit VARCHAR(50);
    _material_codes            TEXT[];

    --record
    _record_item               INTEGER;
    _unit_price                INTEGER;
    _currency                  public.Currency;
    _record_quantity           INTEGER;
    _purchase_orders           TEXT[];
    _purchase_order            TEXT;
    _record_id                 INTEGER;
    _records_id                INTEGER[];
  BEGIN
    --DOMAINS
    FOR i IN 1.._domain_number
      LOOP
        _domains := ARRAY_APPEND( _domains, 'domain' || i || '.com' );
        INSERT INTO Public.Supplier (Name, Domain)
        VALUES ('Supplier ' || i, 'domain' || i || '.com')
        RETURNING Id INTO _supplier_id;
        _supplier_ids := ARRAY_APPEND( _supplier_ids, _supplier_id );
      END LOOP;

    --LOOP FOR USERS
    FOR i IN 1..50
      LOOP
        _user_id := Extensions.Uuid_Generate_V4( );
        _user_name := 'user' || i;
        _user_email := _user_name || '@example.com';
        _profile_role := NULL;

        IF ( i <= 3 )
          THEN
            _user_name := 'admin' || i;
            _profile_role := 'administrator';
            _user_email := _user_name || '@zofzf.online';

          ELSEIF MOD( (SELECT FLOOR( RANDOM( ) * 20 + 1 )::INT), 2 ) = 0
            THEN
              _user_email := _user_name || '@' || _domains[(SELECT FLOOR( RANDOM( ) * ( _domain_number ) + 1 )::INT)];
        END IF;

        IF ( MOD( i, 2 ) = 0 )
          THEN
            _user_name := 'custom_username' || i;
        END IF;

        PERFORM Access.Insert_Test_User( user_id := _user_id, user_email := _user_email, profile_role := _profile_role,
                                         user_name := _user_name );
        _users_id := ARRAY_APPEND( _users_id, _user_id );
      END LOOP;

    DROP FUNCTION IF EXISTS Access.Insert_Test_User(
      user_email TEXT,
      user_id    Uuid,
      user_role  TEXT,
      is_admin   BOOLEAN
    );

    --LOOP FOR MATERIALS
    FOR i IN 1..10
      LOOP
        _material_code := 'material' || i;
        _subheading := (SELECT SUBSTRING( MD5( RANDOM( )::TEXT ), 1, 10 ));
        _material_measurement_unit := 'KG';

        _type := 'national';
        IF MOD( i, 2 ) = 0
          THEN
            _type := 'foreign';
            _material_measurement_unit := 'TON';
        END IF;
        INSERT INTO public.Material (Code, Subheading, Type, Measurement_Unit)
        VALUES (_material_code, _subheading, _type, _material_measurement_unit);
        _material_codes := ARRAY_APPEND( _material_codes, _material_code );
      END LOOP;

    --LOOP FOR RECORDS
    FOR i IN 1..30
      LOOP
        _unit_price := ( FLOOR( ( RANDOM( ) * 100000 + 1 ) )::BIGINT );
        _record_quantity := ( ( FLOOR( RANDOM( ) * 100 + 1 )::INTEGER ) );
        _currency := 'COP';
        _purchase_order := (SELECT SUBSTRING( MD5( RANDOM( )::TEXT ), 1, 10));
        _record_item := (SELECT COUNT( * ) FROM public.Record WHERE Purchase_Order = _purchase_order) + 1;

        IF MOD( i, 3 ) = 0
          THEN
            _currency := 'USD';
        END IF;

        INSERT INTO public.Record (Item, Quantity, Material_Code, Purchase_Order, Measurement_Unit, Unit_Price,
                                  Currency, Supplier_Id)
        VALUES (_record_item, _record_quantity,
                _material_codes[(SELECT FLOOR( RANDOM( ) * ( ARRAY_LENGTH( _material_codes, 1 ) ) + 1 )::INT)],
                _purchase_order,
                'KG', _unit_price, _currency,
                _supplier_ids[(SELECT FLOOR( RANDOM( ) * ( ARRAY_LENGTH( _supplier_ids, 1 ) ) + 1 )::INT)]) RETURNING Id INTO _record_id;
        _records_id := ARRAY_APPEND( _records_id, _record_id );
      END LOOP;

    --LOOP FOR RECORD INFO
    FOR i IN 1..50
      LOOP
        INSERT INTO public.Record_Info (Record_Id, Bill_Number, Trm, Billed_Quantity, Billed_Unit_Price,
                                       Billed_Total_Price, Gross_Weight, Packages, Status, Created_At, Created_By,
                                       Modified_At, conversion)
        VALUES (_records_id[(SELECT FLOOR( RANDOM( ) * ( ARRAY_LENGTH( _records_id, 1 ) ) + 1 )::INT)],
                'PO' || i,
                ( FLOOR( ( RANDOM( ) * 100000 + 1 ) )::BIGINT ),
                ( ( FLOOR( RANDOM( ) * 100 + 1 )::INTEGER ) ),
                ( FLOOR( ( RANDOM( ) * 100000 + 1 ) )::BIGINT ),
                ( FLOOR( ( RANDOM( ) * 100000 + 1 ) )::BIGINT ),
                ( ( FLOOR( RANDOM( ) * 100 + 1 )::INTEGER ) ),
                1,
                'pending',
                NOW( ),
                _users_id[(SELECT FLOOR( RANDOM( ) * ( ARRAY_LENGTH( _users_id, 1 ) ) + 1 )::INT)],
                NOW( ), (RANDOM( ) * 100000 + 1)::DECIMAL);
      END LOOP;
  END $$;