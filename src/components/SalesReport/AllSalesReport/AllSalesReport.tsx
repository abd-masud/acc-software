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

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const invoicesResponse = await fetch(`/api/invoices?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const invoicesJson: InvoiceApiResponse = await invoicesResponse.json();

      if (!invoicesResponse.ok || !invoicesJson.success) {
        throw new Error(invoicesJson.message || "Failed to fetch invoices");
      }

      const customersResponse = await fetch(
        `/api/customers?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer.id;

        const customer = customersData.find((c) => c.id == customerId);

        return customer
          ? {
              ...invoice,
              customer,
            }
          : null;
      })
      .filter(
        (invoice): invoice is InvoiceData & { customer: Customers } =>
          invoice !== null
      );
  }, [invoicesData, customersData]);

  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <AllSalesReportTable
        invoices={Invoices}
        fetchInvoices={fetchData}
        loading={loading}
      />
    </main>
  );
};
