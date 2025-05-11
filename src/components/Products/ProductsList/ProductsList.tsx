"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { ProductsListTable } from "./ProductsListTable";
import { Products, ProductApiResponse } from "@/types/products";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const ProductsListComponent = () => {
  const { user } = useAuth();
  const [productsData, setProductsData] = useState<Products[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useAccUserRedirect();

  const fetchProducts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/products?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json: ProductApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch products");
      }

      setProductsData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <ProductsListTable
        products={productsData}
        fetchProducts={fetchProducts}
        loading={loading}
      />
    </main>
  );
};
