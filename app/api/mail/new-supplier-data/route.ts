import { EmailTemplate } from "@email-templates/supplier-data";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Zofzf team <team@zofzf.online>",
      to: ["phernandezm07@gmail.com"],
      subject: "Hello Pablo",
      react: EmailTemplate({
        purchase_order: "PO01",
        bill: "DDQ23",
        date: new Date().toLocaleDateString(),
        supplier: "Testing@1",
        invoice_id: "AD213ADS",
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
