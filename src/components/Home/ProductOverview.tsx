"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ProductData } from "@/types/chart";
import { InvoiceApiResponse, InvoiceData } from "@/types/invoices";
import { useCallback, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A4DE6C",
  "#D0ED57",
  "#8884D8",
];

export const ProductOverview = () => {
  const { user } = useAuth();
  const [, setInvoicesData] = useState<InvoiceData[]>([]);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

      processProductData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const processProductData = (invoices: InvoiceData[]) => {
    const productMap: Record<string, number> = {};

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const key = `${item.product}_${item.product_id}`;
        if (productMap[key]) {
          productMap[key] += item.quantity;
        } else {
          productMap[key] = item.quantity;
        }
      });
    });

    const processedData = Object.entries(productMap).map(([key, value]) => {
      const [name, productId] = key.split("_");
      return {
        name,
        value,
        productId,
      };
    });

    setProductData(processedData);
  };

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Products Overview
        </h2>
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (productData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Products Overview
        </h2>
        <div className="flex justify-center items-center h-64">
          <p>No product data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Products Overview
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={productData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {productData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${value} units`,
                `${name} (${props.payload.productId})`,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
