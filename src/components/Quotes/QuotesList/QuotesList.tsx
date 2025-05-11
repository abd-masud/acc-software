"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { QuoteApiResponse, QuoteData } from "@/types/quotes";
import { useAuth } from "@/contexts/AuthContext";
import { QuotesListTable } from "./QuotesListTable";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const QuotesListComponent = () => {
  const { user } = useAuth();
  const [quotesData, setQuoteData] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useAccUserRedirect();

  const fetchQuotes = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/quotes?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json: QuoteApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch quotes");
      }

      setQuoteData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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
