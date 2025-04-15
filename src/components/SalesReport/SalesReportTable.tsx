"use client";

import {
  Table,
  TableColumnsType,
  Button,
  Input,
  DatePicker,
  Space,
  Select,
} from "antd";
import React, { useMemo, useState } from "react";
import { InvoiceData, InvoiceItem, InvoicesTableProps } from "@/types/invoices";
import { InvoicesReportButton } from "./InvoicesReport";
import { Customers } from "@/types/customers";
import dayjs, { Dayjs } from "dayjs";

export const SalesReportTable: React.FC<InvoicesTableProps> = ({
  invoices,
  loading,
}) => {
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

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
    let result = invoices;

    // Apply customer filter
    if (selectedCustomer) {
      result = result.filter(
        (invoice) => invoice.customer?.id.toString() === selectedCustomer
      );
    }

    // Apply text search filter
    if (searchText) {
      result = result.filter((invoice) =>
        Object.values(invoice).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Apply date range filter
    if (fromDate && toDate) {
      result = result.filter((invoice) => {
        const invoiceDate = dayjs(invoice.date);
        return (
          invoiceDate.isSame(fromDate, "day") ||
          invoiceDate.isSame(toDate, "day") ||
          (invoiceDate.isAfter(fromDate) && invoiceDate.isBefore(toDate))
        );
      });
    } else if (fromDate) {
      result = result.filter((invoice) => {
        const invoiceDate = dayjs(invoice.date);
        return (
          invoiceDate.isSame(fromDate, "day") || invoiceDate.isAfter(fromDate)
        );
      });
    } else if (toDate) {
      result = result.filter((invoice) => {
        const invoiceDate = dayjs(invoice.date);
        return (
          invoiceDate.isSame(toDate, "day") || invoiceDate.isBefore(toDate)
        );
      });
    }

    return result;
  }, [invoices, selectedCustomer, searchText, fromDate, toDate]);

  const handleResetFilters = () => {
    setSelectedCustomer(null);
    setSearchText("");
    setFromDate(null);
    setToDate(null);
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
      dataIndex: "customer",
      render: (customer: Customers) => (
        <div>
          <div>{customer?.name}</div>
          <div>{customer?.email}</div>
          <div>{customer?.contact}</div>
          <div>{customer?.delivery}</div>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items: InvoiceItem[]) => {
        if (!Array.isArray(items)) return "N/A";
        return items.map((item, index) => (
          <div key={index}>
            {item.product}: {item.quantity} {item.unit}
          </div>
        ));
      },
    },
    {
      title: "Dates",
      render: (record: InvoiceData) => (
        <div>
          <div>
            Date:{" "}
            {new Date(record.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div>
            Due:{" "}
            {new Date(record.due_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Financials",
      render: (record: InvoiceData) => (
        <div>
          {record.subtotal > 0 && (
            <div>Subtotal: {record.subtotal.toFixed(2)} BDT</div>
          )}
          {record.total_tax > 0 && (
            <div>Tax: {record.total_tax.toFixed(2)} BDT</div>
          )}
          {record.discount > 0 && (
            <div>Discount: {record.discount.toFixed(2)} BDT</div>
          )}
          {record.total > 0 && <div>Total: {record.total.toFixed(2)} BDT</div>}
          {record.paid_amount > 0 && (
            <div>Paid: {record.paid_amount.toFixed(2)} BDT</div>
          )}
          {record.due_amount > 0 && (
            <div>Due: {record.due_amount.toFixed(2)} BDT</div>
          )}
        </div>
      ),
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
                placeholder="customer"
                style={{ width: 120 }}
                options={customerOptions}
                value={selectedCustomer}
                onChange={(value) => setSelectedCustomer(value)}
                allowClear
              />
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
                  fromDate
                    ? current && current < fromDate.startOf("day")
                    : false
                }
              />
            </Space>
            {(fromDate || toDate || selectedCustomer || searchText) && (
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
            <InvoicesReportButton invoices={filteredInvoices} />
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
