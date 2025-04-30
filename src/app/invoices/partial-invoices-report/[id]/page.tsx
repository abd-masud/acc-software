"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PartialInvoicesReportComponent } from "@/components/Invoices/PartialInvoicesReport/PartialInvoicesReportComponent";

export default function PartialInvoicesReport() {
  const pathname = usePathname();
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  useEffect(() => {
    if (pathname) {
      const parts = pathname.split("/");
      const extractedId = parts[parts.length - 1];
      const numericId = parseInt(extractedId, 10);

      if (!isNaN(numericId)) {
        setInvoiceId(numericId);
      } else {
        console.error("Invalid invoice ID in URL");
      }
    }
  }, [pathname]);

  if (!invoiceId) return <main>ID not found</main>;

  return <PartialInvoicesReportComponent InvoiceId={invoiceId} />;
}
