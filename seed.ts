import type { Database } from "@lib/database.types";
import { copycat } from "@snaplet/copycat";
import {
  createSeedClient,
  profilesScalars,
  type SeedClient,
} from "@snaplet/seed";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const profilesN = 10;
const suppliersN = 10;
const materialsN = 100;
const base_billsN = 2;

const main = async () => {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase();

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!,
  );

  for (let i = 0; i < profilesN; i++) {
    await supabase.auth.signUp({
      email: `user-${copycat.int(i, { min: 0, max: profilesN })}@email.com`,
      password: "Password123!",
      phone: copycat.phoneNumber(i),
    });
  }
  await supabase.auth.signOut();

  console.log(`--> ${profilesN} Users registered\n`);

  await feed(seed, supabase);

  process.exit();
};

main();

const feed = async (seed: SeedClient, supabase: SupabaseClient<Database>) => {
  const { data: profilesData } = await supabase.from("profiles").select("*");
  const profiles: profilesScalars[] =
    profilesData?.map((profile) => profile) ?? [];

  const { suppliers } = await seed.suppliers((x) =>
    x(suppliersN, (ctx) => ({
      domain: `${copycat.username(ctx.seed)}.com`,
    })),
  );

  console.log(`--> ${suppliers.length} Suppliers inserted\n`);

  const { supplier_employees } = await seed.supplier_employees(
    (x) => x(profilesN),
    {
      connect: { suppliers, profiles },
    },
  );

  console.log(`--> ${supplier_employees.length} Supplier employees inserted\n`);

  const subheadings: Array<string> = [];
  for (let i = 0; i < materialsN; i++) {
    let subheading: string = "";

    if (Math.random() * 99 + 1 <= 50) {
      for (let i = 0; i < 10; i++) {
        subheading += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
      }

      subheadings.push(subheading);
    }
  }

  const { materials } = await seed.materials((x) =>
    x(materialsN, ({ seed }) => ({
      subheading:
        Math.random() * 99 + 1 < 60 ?
          copycat.oneOfString(seed, subheadings)
        : null,
    })),
  );

  console.log(`--> ${materials.length} Materials inserted \n`);

  const { base_bills } = await seed.base_bills(
    (x) =>
      x(base_billsN, ({ seed }) => ({
        item: copycat.int(seed, { min: 0, max: 1000 }),
        total_quantity: copycat.int(seed, { min: 0, max: 500 }),
        unit_price: copycat.int(seed, { min: 0, max: Infinity }),
      })),
    { connect: { suppliers } },
  );

  console.log(`--> ${base_bills.length} Base bills inserted\n`);

  let invoice_counter = 0;
  let supplier_data_counter = 0;

  for (let base_bill of base_bills) {
    const _supplier = suppliers.find(
      (item) => item.supplier_id && item.supplier_id === base_bill.supplier_id,
    );

    if (!_supplier || !_supplier.supplier_id) continue;

    const { invoice_data } = await seed.invoice_data(
      (x) => x({ min: 0, max: 5 }),
      {
        connect: { suppliers: [_supplier] },
      },
    );

    invoice_counter += invoice_data.length;

    for (let _invoice of invoice_data) {
      const _employees = supplier_employees.filter(
        (it) => it.supplier_id === _invoice.supplier_id,
      );

      const { supplier_data } = await seed.supplier_data(
        (x) =>
          x({ max: 10 }, ({ seed }) => ({
            trm: copycat.float(seed, { min: 3800, max: 4500 }),
            billed_quantity: copycat.int(seed, { min: 0, max: 20 }),
            billed_unit_price: copycat.int(seed, { min: 0, max: 10000 }),
            billed_total_price: copycat.int(seed, { min: 0, max: 1000000 }),
            gross_weight: copycat.float(seed, { min: 0, max: 10000 }),
            packages: copycat.float(seed, { min: 0, max: 10000 }),
            created_by: _employees.at(
              copycat.int(seed, { min: 0, max: _employees.length - 1 }),
            )?.profile_id,
          })),
        {
          connect: {
            invoice_data: [_invoice],
            supplier_employees: _employees,
            base_bills: [base_bill],
          },
        },
      );

      supplier_data_counter += supplier_data.length;
    }
  }

  console.log(`--> ${invoice_counter} Invoice data inserted\n`);

  console.log(`--> ${supplier_data_counter} Supplier data inserted\n`);

  console.log("Database seeded successfully!");
};
