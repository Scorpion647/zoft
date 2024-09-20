--TODO: Remove Approved and add an enum to contain the states
CREATE TABLE public.invoice_data (
  invoice_id UUID DEFAULT gen_random_uuid () NOT NULL,
  supplier_id int4 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  approved BOOLEAN DEFAULT FALSE NOT NULL,
  last_modified_by UUID DEFAULT auth.uid (),
  PRIMARY KEY (invoice_id),
  FOREIGN key (supplier_id) REFERENCES public.suppliers (supplier_id) ON DELETE cascade ON UPDATE cascade,
  FOREIGN key (last_modified_by) REFERENCES public.profiles (profile_id) ON DELETE SET NULL ON UPDATE cascade
)
