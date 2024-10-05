import { NextResponse } from "next/server";
import { EmailTemplate } from "@/app/_ui/email-templates/invoice";
import { Resend } from "resend";
import { createClient } from "@lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const data = await request.json();

  if (!data.invoice_id || !data.type) {
    console.error({
      error: "Invalid data",
      data,
    });
    return NextResponse.json({
      error: {
        message: "Invalid data",
      },
      data,
    });
  }

  const supabase = await createClient();
  const { data: sbdata, error: sberror } = await supabase.rpc(
    "get_invoice_email",
    { invoice_id: data.invoice_id },
  );

  if (sberror) {
    console.error(sberror);
    return NextResponse.json({
      error: sberror,
    });
  }

  const email_data = sbdata[0];

  if (!email_data.email || email_data.email.length === 0) {
    return NextResponse.json({
      error: {
        message: "No hay datos de contacto",
      },
    });
  }

  const { error } = await resend.emails.send({
    from: "Zofzf team <team@zofzf.online>",
    to: [data.email],
    subject: data.subject ?? "Aviso",
    react: EmailTemplate({
      bill: email_data.bill_id,
      date: email_data.invoice_updated_at,
      invoice_id: email_data.invoice_id,
      purchase_order: email_data.purchase_order,
      supplier_name: email_data.supplier_name,
      type: data.type,
      body: data.body ?? undefined,
      reason: data.reason ?? undefined,
    }),
  });

  if (error) {
    console.error(error);
    return NextResponse.json({
      error: {
        message: "Server error",
      },
    });
  }

  return NextResponse.json({
    message: "Datos recibidos con éxito",
    receivedData: data,
  });
}
