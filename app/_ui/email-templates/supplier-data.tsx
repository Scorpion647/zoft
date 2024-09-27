import * as React from "react";

interface EmailTemplateProps {
  invoice_id: string;
  date: string;
  supplier: string;
  bill: string;
  purchase_order: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = (
  params,
) => (
  <div>
    <h1>Tu solicitud ha sido recibida para revisión</h1>
    <ul>
      <li>
        <b>Tipo de solicitud:</b> <span>Ingreso</span>
      </li>
      <li>
        <b>Número de solicitud:</b> <span>{params.invoice_id}</span>
      </li>
      <li>
        <b>Fecha Solicitud:</b> <span>{params.date}</span>
      </li>
      <li>
        <b>Proveedor:</b> <span>{params.supplier}</span>
      </li>
      <li>
        <b>Factura:</b> <span>{params.bill}</span>
      </li>
      <li>
        <b>Orden de compra:</b> <span>{params.purchase_order}</span>
      </li>
    </ul>
  </div>
);
