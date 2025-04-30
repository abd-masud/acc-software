"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QuotesItemComponent } from "@/components/Quotes/QuotesItem/QuotesItemComponent";

export default function Quote() {
  const pathname = usePathname();
  const [quoteId, setQuoteId] = useState<number | null>(null);

  useEffect(() => {
    if (pathname) {
      const parts = pathname.split("/");
      const extractedId = parts[parts.length - 1];
      const numericId = parseInt(extractedId, 10);
      if (!isNaN(numericId)) {
        setQuoteId(numericId);
      }
    }
  }, [pathname]);

  if (!quoteId) return <main></main>;

  return <QuotesItemComponent QuoteId={quoteId} />;
}
