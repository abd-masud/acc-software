"use client";

import { Table, TableColumnsType, Button, Input, DatePicker } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { InvoiceData, InvoiceItem, InvoicesTableProps } from "@/types/invoices";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "@/contexts/AuthContext";
import { AllSalesReportButton } from "./AllSalesReportReport";

export const AllSalesReportTable: React.FC<InvoicesTableProps> = ({
  invoices,
  loading,
}) => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [, setDateRangeSelected] = useState(false);

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

  useEffect(() => {
    // Check if both dates are selected
    if (fromDate && toDate) {
      setDateRangeSelected(true);
    } else {
      setDateRangeSelected(false);
    }
  }, [fromDate, toDate]);

  const filteredInvoices = useMemo(() => {
    let sortedInvoices = [...invoices].sort((a, b) => {
      return b.id - a.id;
    });

    // Apply text search filter
    if (searchText) {
      sortedInvoices = sortedInvoices.filter((invoice) =>
        Object.values(invoice).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Apply date range filter
    if (fromDate && toDate) {
      sortedInvoices = sortedInvoices.filter((invoice) => {
        const invoiceDate = dayjs(invoice.date);
        return (
          invoiceDate.isSame(fromDate, "day") ||
          invoiceDate.isSame(toDate, "day") ||
          (invoiceDate.isAfter(fromDate) && invoiceDate.isBefore(toDate))
        );
      });
    } else if (fromDate) {
      sortedInvoices = sortedInvoices.filter((invoice) => {
        const invoiceDate = dayjs(invoice.date);
        return (
          invoiceDate.isSame(fromDate, "day") || invoiceDate.isAfter(fromDate)
        );
      });
    } else if (toDate) {
      sortedInvoices = sortedInvoices.filter((invoice) => {
        const invoiceDate = dayjs(invoice.date);
        return (
          invoiceDate.isSame(toDate, "day") || invoiceDate.isBefore(toDate)
        );
      });
    }

    return sortedInvoices;
  }, [invoices, searchText, fromDate, toDate]);

  const handleResetFilters = () => {
    setSearchText("");
    setFromDate(null);
    setToDate(null);
    setDateRangeSelected(false);
  };

  const columns: TableColumnsType<InvoiceData> = [
    {
      title: "#",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Invoice ID",
      dataIndex: "invoice_id",
    },
    {
      title: "Customer",
      children: [
        {
          title: "Customer ID",
          dataIndex: ["customer", "customer_id"],
          render: (text: string) => text || "-",
        },
        {
          title: "Name",
          dataIndex: ["customer", "name"],
          render: (text: string) => text || "-",
        },
        {
          title: "Email",
          dataIndex: ["customer", "email"],
          render: (text: string) => text || "-",
        },
        {
          title: "Phone",
          dataIndex: ["customer", "contact"],
          render: (text: string) => text || "-",
        },
        {
          title: "Address",
          dataIndex: ["customer", "delivery"],
          render: (text: string) => text || "-",
        },
      ],
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items: InvoiceItem[]) => (
        <div
          className="cursor-default"
          title={
            Array.isArray(items)
              ? items
                  .map(
                    (item) =>
                      `${item.product || "-"} - ${item.quantity} ${item.unit}`
                  )
                  .join("\n")
              : "N/A"
          }
        >
          {Array.isArray(items)
            ? `${items.length} ${items.length == 1 ? "item" : "items"}`
            : "N/A"}
        </div>
      ),
    },
    {
      title: "Dates",
      children: [
        {
          title: "Invoice Date",
          dataIndex: "date",
          render: (date: string) =>
            date
              ? new Date(date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-",
        },
        {
          title: "Due Date",
          dataIndex: "due_date",
          render: (dueDate: string) =>
            dueDate
              ? new Date(dueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-",
        },
      ],
    },
    {
      title: "Financials",
      children: [
        {
          title: "Subtotal",
          dataIndex: "subtotal",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
        {
          title: "Tax",
          dataIndex: "tax",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
        {
          title: "Discount",
          dataIndex: "discount",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
        {
          title: "Total",
          dataIndex: "total",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
        {
          title: "Paid",
          dataIndex: "paid_amount",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
        {
          title: "Due",
          dataIndex: "due_amount",
          render: (value: number) =>
            value > 0 ? `${value.toFixed(2)} ${currencyCode}` : "-",
        },
      ],
    },
    {
      title: "Status",
      render: (record: InvoiceData) => {
        const status = record.due_amount > 0 ? "Due" : "Paid";
        return (
          <span
            className={`font-semibold ${
              status == "Paid" ? "text-green-600" : "text-red-500"
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex sm:justify-between justify-end items-center mb-5">
        <div className="sm:flex items-center hidden">
          <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Invoice Info</h2>
        </div>
        <div className="sm:flex gap-2">
          <div className="flex justify-center items-center sm:mb-0 mb-2 gap-2">
            <DatePicker
              placeholder="From date"
              format="DD MMM YYYY"
              value={fromDate}
              onChange={(date) => setFromDate(date)}
            />
            <DatePicker
              placeholder="To date"
              format="DD MMM YYYY"
              value={toDate}
              onChange={(date) => setToDate(date)}
              disabledDate={(current) =>
                fromDate ? current && current < fromDate.startOf("day") : false
              }
            />
            {(fromDate || toDate || searchText) && (
              <Button onClick={handleResetFilters}>Reset</Button>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Input
              type="text"
              placeholder="Search..."
              className="border text-[14px] w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <AllSalesReportButton invoices={filteredInvoices} />
          </div>
        </div>
      </div>

      <Table
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={filteredInvoices}
        loading={loading}
        bordered
        rowKey="id"
      />
    </main>
  );
};
