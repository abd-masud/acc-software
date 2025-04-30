"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import {
  CustomerQuotesListProps,
  QuoteApiResponse,
  QuoteData,
} from "@/types/quotes";
import { QuotesListTable } from "./CustomerQuotesListTable";

export const CustomerQuotesListComponent = ({
  CustomerId,
}: CustomerQuotesListProps) => {
  const [quotesData, setQuotesData] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (CustomerId) {
        headers["id"] = CustomerId.toString();
      }

      const response = await fetch("/api/quotes/customer-quotes", {
        method: "GET",
        headers,
      });

      const json: QuoteApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch quotes");
      }

      setQuotesData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [CustomerId]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <QuotesListTable
        quotes={quotesData}
        fetchQuotes={fetchQuotes}
        loading={loading}
      />
    </main>
  );
};
