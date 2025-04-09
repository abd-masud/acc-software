"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { ProductsListTable } from "./ProductsListTable";
import { Products, ProductApiResponse } from "@/types/products";
import { useAuth } from "@/contexts/AuthContext";

export const ProductsListComponent = () => {
  const { user } = useAuth();
  const [productsData, setProductsData] = useState<Products[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers["user_id"] = user.id.toString();
      }

      const response = await fetch("/api/products", {
        method: "GET",
        headers,
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
