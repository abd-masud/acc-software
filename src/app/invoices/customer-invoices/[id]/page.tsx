"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CustomerInvoicesListComponent } from "@/components/Invoices/CustomerInvoices/CustomerInvoicesList";

export default function CustomerInvoices() {
  const pathname = usePathname();
  const [customerId, setCustomerId] = useState<number | null>(null);

  useEffect(() => {
    if (pathname) {
      const parts = pathname.split("/");
      const extractedId = parts[parts.length - 1];
      const numericId = parseInt(extractedId, 10);

      if (!isNaN(numericId)) {
        setCustomerId(numericId);
      } else {
        console.error("Invalid customer ID in URL");
      }
    }
  }, [pathname]);

  if (!customerId) return <main>ID not found</main>;

  return <CustomerInvoicesListComponent CustomerId={customerId} />;
}
