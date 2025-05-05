"use client";

import { useAuth } from "@/contexts/AuthContext";
import { InvoiceApiResponse, InvoiceData } from "@/types/invoices";
import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#83a6ed",
  "#8dd1e1",
  "#82ca9d",
  "#a4de6c",
  "#d0ed57",
  "#ffc658",
  "#ff8042",
  "#ff6e7f",
  "#ffa3b5",
  "#b5a3ff",
  "#a3d1ff",
];

export const FinancialOverview = () => {
  const { user } = useAuth();
  const [invoicesData, setInvoicesData] = useState<InvoiceData[]>([]);
  const [currencyCode, setCurrencyCode] = useState("USD");
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
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (user?.id) {
          headers["user_id"] = user.id.toString();
        }
        const currencyRes = await fetch("/api/currencies", {
          method: "GET",
          headers: headers,
        });

        const currencyJson = await currencyRes.json();

        if (currencyRes.status == 404 || !currencyJson.success) {
          setCurrencyCode("USD");
        } else if (currencyJson.data && currencyJson.data.length > 0) {
          setCurrencyCode(currencyJson.data[0].currency || "USD");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setCurrencyCode("USD");
      }
    };

    fetchCurrencies();
  }, [user?.id]);

  const processChartData = () => {
    if (!invoicesData.length) return [];

    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 11);

    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }

    months.reverse();

    const monthlyData: Record<string, number> = {};

    months.forEach(({ year, month }) => {
      const key = `${year}-${month}`;
      monthlyData[key] = 0;
    });

    invoicesData.forEach((invoice) => {
      if (!invoice.date || !invoice.paid_amount) return;

      const date = new Date(invoice.date);
      if (date >= twelveMonthsAgo) {
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (monthlyData[monthYear] !== undefined) {
          monthlyData[monthYear] += invoice.paid_amount;
        }
      }
    });

    return months.map(({ year, month }) => {
      return {
        name: new Date(year, month - 1, 1).toLocaleString("default", {
          month: "short",
        }),
        amount: monthlyData[`${year}-${month}`] || 0,
      };
    });
  };

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const chartData = processChartData();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Financial Overview (Last 12 Months)
      </h2>
      <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
        {loading ? (
          <p className="text-gray-500">Loading data...</p>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `${value} ${currencyCode}`,
                  "Paid Amount",
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No invoice data available</p>
        )}
      </div>
    </div>
  );
};
