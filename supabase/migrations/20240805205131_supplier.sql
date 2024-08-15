-- SUPPLIER TABLE
CREATE TABLE IF NOT EXISTS Public.Supplier (
  id         SERIAL                                  NOT NULL,
  name       VARCHAR(255)                            NOT NULL,
  domain     VARCHAR(255)                            ,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW( ) NOT NULL,

  PRIMARY KEY ( id ),
  UNIQUE ( domain )
);

create function name_domain(supplier public.supplier) returns text as $$
  select $1.name || ' ' || $1.domain;
$$ language sql immutable;


-- permissions
INSERT INTO Access.Table_Name (Name)
VALUES ('supplier');

INSERT INTO Access.Table_Permission (Table_Name, User_Role, Permissions)
VALUES ('supplier', 'administrator', B'1111');

-- SUPPLIER EMPLOYEE TABLE
CREATE TABLE IF NOT EXISTS Public.Supplier_Employee (
  user_id     Uuid    NOT NULL
    UNIQUE,
  supplier_id INTEGER NOT NULL,
  since       TIMESTAMP WITH TIME ZONE DEFAULT NOW( ),

  PRIMARY KEY ( user_id ),
  FOREIGN KEY ( supplier_id ) REFERENCES Public.Supplier ( Id ) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ( user_id ) REFERENCES public.profile ( user_id ) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO Access.Table_Name (Name)
VALUES ('supplier_employee');

INSERT INTO Access.Table_Permission (Table_Name, User_Role, Permissions)
VALUES ('supplier_employee', 'administrator', B'1111');

-- rls for suppliers
ALTER TABLE Public.Supplier
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select for suppliers" ON Public.Supplier FOR SELECT TO Authenticated USING ( Public.Role_Has_Permission( 'supplier', B'0001' ) );
CREATE POLICY "Insert for suppliers" ON Public.Supplier FOR INSERT TO Authenticated WITH CHECK ( Public.Role_Has_Permission( 'supplier', B'0010' ) );
CREATE POLICY "Update for suppliers" ON Public.Supplier FOR UPDATE TO Authenticated USING ( Public.Role_Has_Permission( 'supplier', B'0100' ) );
CREATE POLICY "Delete for suppliers" ON Public.Supplier FOR DELETE TO Authenticated USING ( Public.Role_Has_Permission( 'supplier', B'1000' ) );
CREATE POLICY "Employees can select" ON Public.Supplier FOR SELECT TO Authenticated USING ( EXISTS(SELECT 1
                                                                                                   FROM Public.Supplier_Employee
                                                                                                   WHERE Supplier_Employee.Supplier_Id = Public.Supplier.Id
                                                                                                     AND Supplier_Employee.User_Id = Auth.Uid( )) );

-- rls for supplier employees
ALTER TABLE Public.Supplier_Employee
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select for supplier employees" ON Public.Supplier_Employee FOR SELECT TO Authenticated USING ( Public.Role_Has_Permission( 'supplier_employee', B'0001' ) );
CREATE POLICY "Insert for supplier employees" ON Public.Supplier_Employee FOR INSERT TO Authenticated WITH CHECK ( Public.Role_Has_Permission( 'supplier_employee', B'0010' ) );
CREATE POLICY "Update for supplier employees" ON Public.Supplier_Employee FOR UPDATE TO Authenticated USING ( Public.Role_Has_Permission( 'supplier_employee', B'0100' ) );
CREATE POLICY "Delete for supplier employees" ON Public.Supplier_Employee FOR DELETE TO Authenticated USING ( Public.Role_Has_Permission( 'supplier_employee', B'1000' ) );
CREATE POLICY "Employees can select" ON Public.Supplier_Employee FOR SELECT TO Authenticated USING ( Public.Supplier_Employee.User_Id = Auth.Uid( ) );
