"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { QuoteApiResponse, QuoteData } from "@/types/quotes";
import { useAuth } from "@/contexts/AuthContext";
import { QuotesListTable } from "./QuotesListTable";

export const QuotesListComponent = () => {
  const { user } = useAuth();
  const [quotesData, setQuoteData] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers["user_id"] = user.id.toString();
      }

      const response = await fetch("/api/quotes", {
        method: "GET",
        headers,
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
