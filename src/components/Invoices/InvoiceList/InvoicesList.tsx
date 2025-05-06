"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { InvoiceApiResponse, InvoiceData } from "@/types/invoices";
import { useAuth } from "@/contexts/AuthContext";
import { InvoicesListTable } from "./InvoicesListTable";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const InvoicesListComponent = () => {
  const { user } = useAuth();
  const [invoicesData, setInvoicesData] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useAccUserRedirect();
  if (!user) return null;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers["user_id"] = user.id.toString();
      }

      const response = await fetch("/api/invoices", {
        method: "GET",
        headers,
      });

      const json: InvoiceApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch invoices");
      }

      setInvoicesData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <InvoicesListTable
        invoices={invoicesData}
        fetchInvoices={fetchInvoices}
        loading={loading}
      />
    </main>
  );
};
