"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import {
  CustomerInvoicesListProps,
  InvoiceApiResponse,
  InvoiceData,
} from "@/types/invoices";
import { InvoicesListTable } from "./CustomerInvoicesListTable";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const CustomerInvoicesListComponent = ({
  CustomerId,
}: CustomerInvoicesListProps) => {
  const [invoicesData, setInvoicesData] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  useAccUserRedirect();

  const fetchInvoices = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(
        `/api/invoices/customer-invoices?id=${CustomerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
  }, [CustomerId, user?.id]);

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
