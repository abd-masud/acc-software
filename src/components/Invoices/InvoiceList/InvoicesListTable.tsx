"use client";

import { Table, TableColumnsType, Button, message, Input, Modal } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { InvoiceData, InvoiceItem, InvoicesTableProps } from "@/types/invoices";
import { InvoicesModal } from "./InvoicesModal";
import Link from "next/link";
import {
  MdOutlineDeleteSweep,
  MdOutlinePictureAsPdf,
  MdPaid,
} from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";

export const InvoicesListTable: React.FC<InvoicesTableProps> = ({
  invoices,
  fetchInvoices,
  loading,
}) => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(
    null
  );
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceData | null>(
    null
  );
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [searchText, setSearchText] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const showInvoiceModal = (invoice: InvoiceData) => {
    setCurrentInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const showDeleteModal = (invoice: InvoiceData) => {
    setInvoiceToDelete(invoice);
    setDeleteConfirmationText("");
    setIsDeleteModalOpen(true);
  };

  const filteredInvoices = useMemo(() => {
    const sortedInvoices = [...invoices].sort((a, b) => {
      return b.id - a.id;
    });
    if (!searchText) return sortedInvoices;

    return sortedInvoices.filter((invoice) =>
      Object.values(invoice).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [invoices, searchText]);

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

  const handleEditSubmit = async (updatedInvoice: InvoiceData) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInvoice),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice");
      }

      message.success("Invoice updated successfully");
      setIsEditModalOpen(false);
      fetchInvoices();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      const response = await fetch("/api/invoices", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: invoiceToDelete.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      message.success("Customer deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteConfirmationText("");
      fetchInvoices();
    } catch {
      message.error("Delete failed");
    }
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
            ? `${items.length} ${items.length === 1 ? "item" : "items"}`
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
    {
      title: "Action",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="text-white text-[16px] bg-blue-500 hover:bg-blue-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
            onClick={() => showInvoiceModal(record)}
            title="Pay"
          >
            <MdPaid />
          </button>
          <Link
            className="text-white hover:text-white text-[16px] bg-yellow-500 hover:bg-yellow-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
            href={`/invoices/${record.id}`}
            title="Invoice"
          >
            <MdOutlinePictureAsPdf />
          </Link>
          <button
            className="text-white text-[17px] bg-red-500 hover:bg-red-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
            onClick={() => showDeleteModal(record)}
            title="Delete"
          >
            <MdOutlineDeleteSweep />
          </button>
        </div>
      ),
    },
  ];

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <div className="flex sm:justify-between justify-end items-center mb-5">
        <div className="sm:flex items-center hidden">
          <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Invoices Info</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Input
            type="text"
            placeholder="Search..."
            className="border text-[14px] sm:w-40 w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
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

      <InvoicesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentInvoice={currentInvoice}
        onSave={handleEditSubmit}
      />

      <Modal
        title="Confirm Delete Invoice"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={handleDelete}
            disabled={deleteConfirmationText !== "DELETE"}
          >
            Delete Invoice
          </Button>,
        ]}
        destroyOnClose
      >
        <div className="space-y-4">
          <p>
            To confirm, type{" "}
            <span className="font-bold">&quot;DELETE&quot;</span> in the box
            below
          </p>
          <input
            placeholder="DELETE"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
          />
          <p className="text-red-500 text-[12px] font-bold">
            Warning: This action will permanently delete the invoice record.
          </p>
        </div>
      </Modal>
    </main>
  );
};
