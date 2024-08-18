CREATE TABLE IF NOT EXISTS Public.processed_bill (
  id            SERIAL
    PRIMARY KEY,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW( ) NOT NULL
);

CREATE TABLE IF NOT EXISTS Public.processed_bill_item (
  id               SERIAL
    PRIMARY KEY,
  bill_id          INTEGER         NOT NULL
    REFERENCES Public.processed_bill ( id ),
  purchase_order   VARCHAR(50)     NOT NULL,
  item             INTEGER         NOT NULL,
  material_code    VARCHAR(50)     NOT NULL,
  quantity         INTEGER         NOT NULL,
  measurement_unit VARCHAR(50)     NOT NULL,
  net_price        BIGINT          NOT NULL,
  bill_net_price   BIGINT          NOT NULL,
  supplier         VARCHAR(50)     NOT NULL,
  currency         Public.Currency NOT NULL
);

INSERT INTO Access.Table_Name (Name)
VALUES ('processed_bill');
INSERT INTO Access.Table_Permission (Table_Name, User_Role, Permissions)
VALUES ('processed_bill', 'administrator', '1111');

INSERT INTO Access.Table_Name (Name)
VALUES ('processed_bill_item');
INSERT INTO Access.Table_Permission (Table_Name, User_Role, Permissions)
VALUES ('processed_bill_item', 'administrator', '1111');

CREATE POLICY "select policy" ON Public.processed_bill FOR SELECT USING ( Public.Role_Has_Permission( 'proccessed_bill', B'0001' ) );
CREATE POLICY "insert policy" ON Public.processed_bill_item FOR INSERT WITH CHECK ( Public.Role_Has_Permission( 'proccessed_bill_item', B'0010' ) );
CREATE POLICY "update policy" ON Public.processed_bill_item FOR UPDATE USING ( Public.Role_Has_Permission( 'proccessed_bill_item', B'0100' ) );
CREATE POLICY "delete policy" ON Public.processed_bill_item FOR DELETE USING ( Public.Role_Has_Permission( 'proccessed_bill_item', B'1000' ) );

CREATE OR REPLACE FUNCTION Public.process_bill(
  record_id INTEGER
) RETURNS VOID
AS $$
BEGIN
  INSERT INTO Public.processed_bill (processed_at) VALUES (NOW( ));

  VALUES (NOW( ));
  INSERT INTO Public.processed_bill_item (bill_id,
                                           purchase_order,
                                           item,
                                           material_code,
                                           quantity,
                                           measurement_unit,
                                           net_price,
                                           bill_net_price,
                                           supplier,
                                           currency)
  SELECT pb.id,
         r.Purchase_Order,
         r.Item,
         r.Material_Code,
         r.Quantity,
         r.Measurement_Unit,
         r.Unit_Price,
         SUM( r.Unit_Price * r.Quantity ) OVER (PARTITION BY r.Purchase_Order) AS bill_net_price,
         s.Name,
         r.Currency
  FROM Public.Record r
         INNER JOIN Public.Supplier_Employee se ON r.Supplier_Id = se.Supplier_Id
         INNER JOIN Public.Record_Info ri ON r.Id = ri.Record_Id
         INNER JOIN Public.processed_bill pb ON ri.Id = pb.id
         INNER JOIN Public.Supplier s ON r.Supplier_Id = s.Id
  WHERE r.Id = $1;
END; $$
  LANGUAGE Plpgsql SECURITY INVOKER;