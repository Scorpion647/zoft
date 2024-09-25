import { EmailTemplate } from "@email-templates/supplier-data";
import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { email, purchase_order, bill, date, supplier_name, invoice_id } =
    await req.body;

  if (
    !email ||
    !purchase_order ||
    !bill ||
    !date ||
    !supplier_name ||
    !invoice_id
  ) {
    return res.status(400).json({ error: { message: "Invalid request" } });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Zofzf team <team@zofzf.online>",
      to: [email],
      subject: "Solicitud recibida",
      react: EmailTemplate({
        purchase_order: purchase_order,
        bill: bill,
        date: date,
        supplier: supplier_name,
        invoice_id: invoice_id,
      }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
