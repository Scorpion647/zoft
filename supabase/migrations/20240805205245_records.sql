COMMENT ON TABLE Access.Table_Permission IS '-- SELECT 0001
-- INSERT 0010
-- UPDATE 0100
-- DELETE 1000';


DROP TYPE IF EXISTS Public.Material_Type;
CREATE TYPE Public.Material_Type AS ENUM ( 'national', 'foreign', 'nationalized', 'other' );

CREATE TABLE IF NOT EXISTS Public.material (
  code             VARCHAR(255),
  subheading       VARCHAR(10) check ( LENGTH( subheading ) = 10 ),
  type             Public.Material_Type,
  measurement_unit VARCHAR(50),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW( ) NOT NULL,

  PRIMARY KEY ( code ),
  UNIQUE ( code )
);

DROP TYPE IF EXISTS Public.Currency;
CREATE TYPE Public.Currency AS ENUM ('COP', 'USD', 'EUR');
CREATE DOMAIN positive_integer AS INTEGER CHECK ( VALUE > 0 );

CREATE TABLE IF NOT EXISTS Public.Record (
  id               SERIAL           NOT NULL,
  item             Positive_Integer NOT NULL,
  quantity         Positive_Integer NOT NULL DEFAULT 0,
  material_code    VARCHAR(50)      NOT NULL,
  purchase_order   VARCHAR(50)      NOT NULL,
  measurement_unit VARCHAR(50)      NOT NULL,
  unit_price       BIGINT           NOT NULL,
  currency         Public.Currency   NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE  DEFAULT NOW( ) NOT NULL,
  supplier_id      INTEGER          NOT NULL,
  description      VARCHAR(50),
  net_price        BIGINT,

  PRIMARY KEY ( id ),
  FOREIGN KEY ( supplier_id ) REFERENCES Public.Supplier ( Id ) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE ( id, purchase_order )
);

DROP TYPE IF EXISTS Public.Request_Status;
CREATE TYPE Public.Request_Status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS Public.record_info (
  id                 SERIAL               NOT NULL,
  record_id          INTEGER              NOT NULL,
  bill_number        VARCHAR(50)          NOT NULL,
  trm                DECIMAL              NOT NULL,
  billed_quantity    INTEGER              NOT NULL,
  billed_unit_price  BIGINT               NOT NULL,
  billed_total_price BIGINT               NOT NULL,
  gross_weight       DECIMAL               NOT NULL,
  packages           DECIMAL              NOT NULL,
  status             Public.Request_Status NOT NULL DEFAULT 'pending',
  created_at         TIMESTAMP WITH TIME ZONE      DEFAULT NOW( ) NOT NULL,
  created_by         Uuid                 NOT NULL DEFAULT Auth.Uid( ),
  modified_at        TIMESTAMP WITH TIME ZONE      DEFAULT NOW( ) NOT NULL,
  conversion           DECIMAL              NOT NULL,

  PRIMARY KEY ( id ),
  FOREIGN KEY ( record_id ) REFERENCES Public.Record ( Id ) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ( created_by ) REFERENCES Public.Profile ( User_Id ) ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE Public.Material
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE Public.Record
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE Public.Record_Info
  ENABLE ROW LEVEL SECURITY;

INSERT INTO Access.Table_Name (Name)
VALUES ('material');
INSERT INTO Access.Table_Permission (Table_Name, User_Role, Permissions)
VALUES ('material', 'administrator', '1111');

INSERT INTO Access.Table_Name (Name)
VALUES ('record');
INSERT INTO Access.Table_Permission (Table_Name, User_Role, Permissions)
VALUES ('record', 'administrator', '1111');

INSERT INTO Access.Table_Name (Name)
VALUES ('record_info');
INSERT INTO Access.Table_Permission (Table_Name, User_Role, Permissions)
VALUES ('record_info', 'administrator', '1111');

CREATE OR REPLACE FUNCTION Public.can_access_material(code Material.Code%Type, permission BIT(4)) RETURNS BOOLEAN AS $$
   BEGIN
       RETURN Public.Role_Has_Permission( 'material', permission ) OR EXISTS ((SELECT 1 from public.material
                         inner join public.record r on material.code = r.material_code
                         inner join public.supplier_employee se on r.supplier_id = se.supplier_id
       where material.code = $1 and se.user_id = Auth.Uid()));
   END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION Public.can_access_record(id Record.Id%Type, permission BIT(4)) RETURNS BOOLEAN AS $$
   BEGIN
       RETURN Public.Role_Has_Permission( 'record', permission ) OR EXISTS ((SELECT 1 from public.record r
                         inner join public.supplier_employee se on r.supplier_id = se.supplier_id
       where r.id = $1 and se.user_id = Auth.Uid()));
   END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Select policy" ON Public.Material FOR SELECT USING ( Public.can_access_material( code, B'0001' ) );
CREATE POLICY "Insert policy" ON Public.Material FOR INSERT WITH CHECK (public.role_has_permission('material', B'0010') );
CREATE POLICY "Update policy" ON Public.Material FOR UPDATE USING (Public.role_has_permission('material', B'0100'));
CREATE POLICY "Delete policy" ON Public.Material FOR DELETE USING (Public.role_has_permission('material', B'1000'));

CREATE POLICY "Select policy" ON Public.Record FOR SELECT USING ( public.can_access_record( id, B'0001' ) );
CREATE POLICY "Insert policy" ON Public.Record FOR INSERT WITH CHECK ( public.role_has_permission( 'record', B'0010' ) );
CREATE POLICY "Update policy" ON Public.Record FOR UPDATE USING ( public.role_has_permission( 'record', B'0100' ) );
CREATE POLICY "Delete policy" ON Public.Record FOR DELETE USING ( public.role_has_permission('record', B'1000') );


create or replace function public.can_access_record_info(id record_info.id%type, permission bit(4)) returns boolean as $$
   begin
       return public.role_has_permission('record_info', permission) or exists ((select 1 from public.record_info ri
        inner join public.record r on ri.record_id = r.id
        where ri.id = $1  and ri.created_by = auth.uid()));

  end; $$ language plpgsql security definer;

create or replace function public.can_insert_record_info(id record_info.id%type, permission bit(4)) returns boolean as $$
   begin
       return public.role_has_permission('record_info', permission) or exists ((select 1 from public.record_info ri
        inner join public.record r on ri.record_id = r.id
        inner join public.supplier_employee se on r.supplier_id = se.supplier_id
        where ri.id = $1  and se.user_id = auth.uid()));

  end; $$ language plpgsql security definer;

CREATE POLICY "Select policy" ON Public.Record_Info FOR SELECT USING ( public.can_access_record_info( id, B'0001' ) );
CREATE POLICY "Insert policy" ON Public.Record_Info FOR INSERT WITH CHECK ( public.can_insert_record_info( id, B'0010' ) );
CREATE POLICY "Update policy" ON Public.Record_Info FOR UPDATE USING ( public.can_access_record_info( id, B'0100' ) );
CREATE POLICY "Delete policy" ON Public.Record_Info FOR DELETE USING ( public.can_access_record_info( id, B'1000' ) );