CREATE TYPE public.Material_Type AS ENUM ( 'national', 'foreign','nationalized', 'other');

CREATE TABLE IF NOT EXISTS Public.materials (
  material_code             VARCHAR(255),
  subheading       VARCHAR(10) check ( LENGTH( subheading ) = 10 ),
  type             Public.Material_Type,
  measurement_unit VARCHAR(50),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW( ) NOT NULL,

  PRIMARY KEY ( material_code )
);

CREATE TYPE Public.Currency AS ENUM ('COP', 'USD', 'EUR');
CREATE DOMAIN positive_integer AS INTEGER CHECK ( VALUE > 0 );

create table public.base_bills (
  base_bill_id     uuid             default uuid_generate_v4() not null,
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

  PRIMARY KEY ( base_bill_id ),
  FOREIGN KEY ( supplier_id ) REFERENCES Public.Suppliers ( supplier_id ) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE ( base_bill_id, purchase_order )
);
