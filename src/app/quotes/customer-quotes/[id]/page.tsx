"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CustomerQuotesListComponent } from "@/components/Quotes/CustomerQuotes/CustomerQuotesList";

export default function CustomerQuotes() {
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

  return <CustomerQuotesListComponent CustomerId={customerId} />;
}
