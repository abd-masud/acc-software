"use client";

import { useAuth } from "@/contexts/AuthContext";
import { CustomerApiResponse, Customers } from "@/types/customers";
import { InvoiceApiResponse, InvoiceData } from "@/types/invoices";
import { ProductApiResponse, Products } from "@/types/products";
import { useCallback, useEffect, useState } from "react";
import { FiFileText, FiTrendingUp, FiUsers, FiPackage } from "react-icons/fi";

export const MetricsCards = () => {
  const { user } = useAuth();
  const [invoicesData, setInvoicesData] = useState<InvoiceData[]>([]);
  const [productsData, setProductsData] = useState<Products[]>([]);
  const [customersData, setCustomersData] = useState<Customers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers["user_id"] = user.id.toString();
      }

      // Fetch invoices
      const invoicesResponse = await fetch("/api/invoices", {
        method: "GET",
        headers,
      });
      const invoicesJson: InvoiceApiResponse = await invoicesResponse.json();
      if (!invoicesResponse.ok || !invoicesJson.success) {
        throw new Error(invoicesJson.message || "Failed to fetch invoices");
      }
      setInvoicesData(invoicesJson.data);

      // Fetch products
      const productsResponse = await fetch("/api/products", {
        method: "GET",
        headers,
      });
      const productsJson: ProductApiResponse = await productsResponse.json();
      if (!productsResponse.ok || !productsJson.success) {
        throw new Error(productsJson.message || "Failed to fetch products");
      }
      setProductsData(productsJson.data);

      // Fetch customers
      const customersResponse = await fetch("/api/customers", {
        method: "GET",
        headers,
      });
      const customersJson: CustomerApiResponse = await customersResponse.json();
      if (!customersResponse.ok || !customersJson.success) {
        throw new Error(customersJson.message || "Failed to fetch customers");
      }
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

  // Calculate metrics from the fetched data
  const calculateMetrics = () => {
    const totalRevenue = invoicesData.reduce((sum, invoice) => {
      return sum + invoice.paid_amount;
    }, 0);

    const totalDue = invoicesData.reduce((sum, invoice) => {
      return sum + invoice.due_amount;
    }, 0);

    const totalProducts = productsData.length;
    const totalCustomers = customersData.length;

    return [
      {
        title: "Total Revenue",
        value: `$${totalRevenue.toLocaleString()}`,
        change: "On Target", // Status instead of change
        icon: <FiTrendingUp className="text-green-500" size={24} />,
      },
      {
        title: "Receivables",
        value: `$${totalDue.toLocaleString()}`,
        change: "Action Needed", // Status indicator
        icon: <FiFileText className="text-yellow-500" size={24} />,
      },
      {
        title: "Products",
        value: totalProducts.toString(),
        change: "In Stock", // Inventory status
        icon: <FiPackage className="text-blue-500" size={24} />,
      },
      {
        title: "Customers",
        value: totalCustomers.toString(),
        change: "Active", // Customer status
        icon: <FiUsers className="text-purple-500" size={24} />,
      },
    ];
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mt-4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                {metric.title}
              </p>
              <p className="text-2xl font-bold mt-2 text-gray-800">
                {metric.value}
              </p>
              <p className="text-sm mt-1 text-green-600">{metric.change}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">{metric.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
