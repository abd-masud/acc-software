"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import {
  InvoiceApiResponse,
  InvoiceData,
  PartialInvoicesItemProps,
} from "@/types/invoices";
import { PartialInvoicesListTable } from "./PartialInvoicesListTable";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const PartialInvoicesListComponent = ({
  InvoiceId,
}: PartialInvoicesItemProps) => {
  const [invoicesData, setInvoicesData] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  useAccUserRedirect();

  const fetchInvoices = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (InvoiceId) {
        headers["id"] = InvoiceId.toString();
      }

      const response = await fetch("/api/invoices/single-invoice", {
        method: "GET",
        headers,
      });

      const json: InvoiceApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch invoices");
      }
      const rawData = Array.isArray(json.data)
        ? json.data
        : json.data
        ? [json.data]
        : [];
      setInvoicesData(rawData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [InvoiceId, user?.id]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <PartialInvoicesListTable
        invoices={invoicesData}
        fetchInvoices={fetchInvoices}
        loading={loading}
      />
    </main>
  );
};
