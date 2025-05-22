"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { SuppliersListTable } from "./SuppliersListTable";
import { SupplierApiResponse, Suppliers } from "@/types/suppliers";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const SuppliersListComponent = () => {
  const { user } = useAuth();
  const [suppliersData, setSuppliersData] = useState<Suppliers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useAccUserRedirect();

  const fetchSuppliers = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/suppliers?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json: SupplierApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch suppliers");
      }

      setSuppliersData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <SuppliersListTable
        suppliers={suppliersData}
        fetchSuppliers={fetchSuppliers}
        loading={loading}
      />
    </main>
  );
};
