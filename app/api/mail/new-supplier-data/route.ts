import {
  EmailTemplate,
  type EmailTemplateProps,
} from "@/app/_ui/email-templates/invoice";
import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const {
    email,
    purchase_order,
    bill,
    date,
    supplier_name,
    invoice_id,
    type,
    reason,
    body,
    subject,
  } = await req.body;

  if (
    !invoice_id ||
    !type ||
    !date ||
    !supplier_name ||
    !bill ||
    !purchase_order
  ) {
    return res.status(400).json({ error: { message: "Invalid request" } });
  }

  const props: EmailTemplateProps = {
    bill,
    date,
    invoice_id,
    purchase_order,
    supplier_name,
    type,
  };

  if (reason) props.reason = reason;
  if (body) props.body = body;

  try {
    const { data, error } = await resend.emails.send({
      from: "Zofzf team <team@zofzf.online>",
      to: [email],
      subject: subject ?? "Aviso",
      react: EmailTemplate(props),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
