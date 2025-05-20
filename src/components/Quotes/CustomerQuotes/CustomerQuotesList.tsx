"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import {
  CustomerQuotesListProps,
  QuoteApiResponse,
  QuoteData,
} from "@/types/quotes";
import { QuotesListTable } from "./CustomerQuotesListTable";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const CustomerQuotesListComponent = ({
  CustomerId,
}: CustomerQuotesListProps) => {
  const [quotesData, setQuotesData] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  useAccUserRedirect();

  const fetchQuotes = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(
        `/api/quotes/customer-quotes?id=${CustomerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
  }, [CustomerId, user?.id]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <QuotesListTable
        quotes={quotesData}
        fetchQuotes={fetchQuotes}
        loading={loading}
      />
    </main>
  );
};
