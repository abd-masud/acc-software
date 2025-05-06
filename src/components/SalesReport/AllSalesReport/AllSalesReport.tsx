"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb } from "./Breadcrumb";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AllSalesReportTable } from "./AllSalesReportTable";
import { InvoiceApiResponse, InvoiceData } from "@/types/invoices";
import { CustomerApiResponse, Customers } from "@/types/customers";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const AllSalesReportComponent = () => {
  const { user } = useAuth();
  const [invoicesData, setInvoicesData] = useState<InvoiceData[]>([]);
  const [customersData, setCustomersData] = useState<Customers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useAccUserRedirect();
  if (!user) return null;

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers["user_id"] = user.id.toString();
      }

      const invoicesResponse = await fetch("/api/invoices", {
        method: "GET",
        headers,
      });

      const invoicesJson: InvoiceApiResponse = await invoicesResponse.json();

      if (!invoicesResponse.ok || !invoicesJson.success) {
        throw new Error(invoicesJson.message || "Failed to fetch invoices");
      }

      const customersResponse = await fetch("/api/customers", {
        method: "GET",
        headers,
      });

      const customersJson: CustomerApiResponse = await customersResponse.json();

      if (!customersResponse.ok || !customersJson.success) {
        throw new Error(customersJson.message || "Failed to fetch customers");
      }

      setInvoicesData(invoicesJson.data);
      setCustomersData(customersJson.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const Invoices = useMemo(() => {
    return invoicesData
      .map((invoice) => {
        const customer = customersData.find((c) => c.id == invoice.customer.id);
        return customer ? { ...invoice, customer } : null;
      })
      .filter((invoice): invoice is InvoiceData => invoice !== null);
  }, [invoicesData, customersData]);

  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <AllSalesReportTable
        invoices={Invoices}
        fetchInvoices={fetchData}
        loading={loading}
      />
    </main>
  );
};
