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
const base_billsN = 50;
const invoice_dataN = 5;
const supplier_dataN = 200;

const main = async () => {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase();

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  );

  for (let i = 0; i < profilesN; i++) {
    await supabase.auth
      .signUp({
        email: `user-${copycat.int(i, { min: 0, max: profilesN })}@email.com`,
        password: "Password123!",
        phone: copycat.phoneNumber(i),
      })
      .then((result) => {
        console.info(`User ${i} signed up`);
      });
  }

  await feed(seed, supabase);

  process.exit();
};

main();

const feed = async (seed: SeedClient, supabase: SupabaseClient<Database>) => {
  const { data: profilesData } = await supabase.from("profiles").select();
  const profiles: profilesScalars[] =
    profilesData?.map((profile) => profile) ?? [];

  const { suppliers } = await seed.suppliers((x) =>
    x(suppliersN, (ctx) => ({
      domain: `${copycat.username(ctx.seed)}.com`,
    })),
  );

  const { supplier_employees } = await seed.supplier_employees(
    (x) => x(profilesN),
    {
      connect: { profiles, suppliers },
    },
  );

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

  const { base_bills } = await seed.base_bills(
    (x) =>
      x(base_billsN, ({ seed }) => ({
        item: copycat.int(seed, { min: 0, max: 1000 }),
        quantity: copycat.int(seed, { min: 0, max: 5000 }),
        unit_price: copycat.int(seed, { min: 0, max: Infinity }),
      })),
    { connect: { suppliers } },
  );

  const { invoice_data } = await seed.invoice_data((x) => x(invoice_dataN), {
    connect: { profiles, suppliers },
  });

  const { supplier_data } = await seed.supplier_data(
    (x) =>
      x(supplier_dataN, ({ seed }) => ({
        trm: copycat.float(seed, { min: 3800, max: 4500 }),
        billed_quantity: copycat.int(seed, { min: 0, max: 10 }),
        billed_unit_price: copycat.int(seed, { min: 0, max: 10000 }),
        billed_total_price: copycat.int(seed, { min: 0, max: 1000000 }),
        gross_weight: copycat.float(seed, { min: 0, max: 10000 }),
        packages: copycat.float(seed, { min: 0, max: 10000 }),
      })),
    { connect: { supplier_employees, base_bills, profiles, invoice_data } },
  );

  console.log("Database seeded successfully!");
};
