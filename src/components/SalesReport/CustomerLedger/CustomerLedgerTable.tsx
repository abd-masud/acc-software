"use client";

import {
  Table,
  TableColumnsType,
  Button,
  Input,
  Space,
  Select,
  Alert,
  Card,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { InvoiceData, InvoiceItem, InvoicesTableProps } from "@/types/invoices";
import { CustomerLedgerReportButton } from "./CustomerLedgerReport";
import { Customers } from "@/types/customers";
import { useAuth } from "@/contexts/AuthContext";

export const CustomerLedgerTable: React.FC<InvoicesTableProps> = ({
  invoices,
  loading,
}) => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [customerSelected, setCustomerSelected] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchCurrencies = async () => {
      try {
        const currencyRes = await fetch(`/api/currencies?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
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
    // Check if customer is selected
    if (selectedCustomer) {
      setCustomerSelected(true);
    } else {
      setCustomerSelected(false);
    }
  }, [selectedCustomer]);

  // Extract unique customers from invoices
  const customerOptions = useMemo(() => {
    const uniqueCustomers = new Map<string, Customers>();
    invoices.forEach((invoice) => {
      if (invoice.customer) {
        uniqueCustomers.set(invoice.customer.id.toString(), invoice.customer);
      }
    });
    return Array.from(uniqueCustomers.values()).map((customer) => ({
      value: customer.id.toString(),
      label: customer.name,
    }));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    let sortedInvoices = [...invoices].sort((a, b) => {
      return b.id - a.id;
    });

    // Apply customer filter
    if (selectedCustomer) {
      sortedInvoices = sortedInvoices.filter(
        (invoice) => invoice.customer?.id.toString() == selectedCustomer
      );
    }

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

    return sortedInvoices;
  }, [invoices, selectedCustomer, searchText]);

  const handleResetFilters = () => {
    setSelectedCustomer(null);
    setSearchText("");
    setCustomerSelected(false);
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
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
        {
          title: "Tax",
          dataIndex: "tax",
          render: (value: number) =>
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
        {
          title: "Discount",
          dataIndex: "discount",
          render: (value: number) =>
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
        {
          title: "Total",
          dataIndex: "total",
          render: (value: number) =>
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
        {
          title: "Paid",
          dataIndex: "paid_amount",
          render: (value: number) =>
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
        {
          title: "Due",
          dataIndex: "due_amount",
          render: (value: number) =>
            value > 0 ? `${value} ${currencyCode}` : "-",
        },
      ],
    },
    {
      title: "Status",
      render: (record: InvoiceData) => {
        const status = Number(record.due_amount) > 0 ? "Due" : "Paid";
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
          <div className="flex items-center sm:mb-0 mb-2 gap-2">
            <Space direction="horizontal" size={12}>
              <Select
                placeholder="Select customer"
                style={{ width: 200 }}
                options={customerOptions}
                value={selectedCustomer}
                onChange={(value) => setSelectedCustomer(value)}
                allowClear
              />
            </Space>
            {(selectedCustomer || searchText) && (
              <Button onClick={handleResetFilters}>Reset</Button>
            )}
          </div>
          {customerSelected && (
            <div className="flex items-center justify-end gap-2">
              <Input
                type="text"
                placeholder="Search..."
                className="border text-[14px] w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <CustomerLedgerReportButton invoices={filteredInvoices} />
            </div>
          )}
        </div>
      </div>

      {!customerSelected ? (
        <Card>
          <Alert
            message="Please select a customer to view their invoices"
            type="info"
            showIcon
          />
        </Card>
      ) : (
        <Table
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={filteredInvoices}
          loading={loading}
          bordered
          rowKey="id"
        />
      )}
    </main>
  );
};
