"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { CustomersListTable } from "./CustomersListTable";
import { CustomerApiResponse, Customers } from "@/types/customers";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const CustomersListComponent = () => {
  const { user } = useAuth();
  const [customersData, setCustomersData] = useState<Customers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useAccUserRedirect();

  const fetchCustomers = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers["user_id"] = user.id.toString();
      }

      const response = await fetch("/api/customers", {
        method: "GET",
        headers,
      });

      const json: CustomerApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch customers");
      }

      setCustomersData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <CustomersListTable
        customers={customersData}
        fetchCustomers={fetchCustomers}
        loading={loading}
      />
    </main>
  );
};
