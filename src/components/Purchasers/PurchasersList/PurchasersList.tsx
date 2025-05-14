"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { PurchasersListTable } from "./PurchasersListTable";
import { PurchaserApiResponse, Purchasers } from "@/types/purchasers";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const PurchasersListComponent = () => {
  const { user } = useAuth();
  const [purchasersData, setPurchasersData] = useState<Purchasers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useAccUserRedirect();

  const fetchPurchasers = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/purchasers?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json: PurchaserApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch purchasers");
      }

      setPurchasersData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPurchasers();
  }, [fetchPurchasers]);

  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <PurchasersListTable
        purchasers={purchasersData}
        fetchPurchasers={fetchPurchasers}
        loading={loading}
      />
    </main>
  );
};
