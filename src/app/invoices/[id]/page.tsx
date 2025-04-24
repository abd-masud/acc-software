"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { InvoicesItemComponent } from "@/components/Invoices/InvoicesItem/InvoicesItemComponent";

export default function Invoice() {
  const pathname = usePathname();
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  useEffect(() => {
    if (pathname) {
      const parts = pathname.split("/");
      const extractedId = parts[parts.length - 1];
      const numericId = parseInt(extractedId, 10);
      if (!isNaN(numericId)) {
        setInvoiceId(numericId);
      }
    }
  }, [pathname]);

  if (!invoiceId) return <main></main>;

  return <InvoicesItemComponent InvoiceId={invoiceId} />;
}
