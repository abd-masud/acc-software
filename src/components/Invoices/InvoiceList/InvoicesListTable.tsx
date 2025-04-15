"use client";

import {
  Table,
  TableColumnsType,
  Button,
  Dropdown,
  MenuProps,
  Popconfirm,
  message,
  Input,
} from "antd";
import React, { useMemo, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { InvoiceData, InvoiceItem, InvoicesTableProps } from "@/types/invoices";
import { EditInvoicesModal } from "./EditInvoicesModal";
import { InvoicesReportButton } from "./InvoicesReport";
import { Customers } from "@/types/customers";

export const InvoicesListTable: React.FC<InvoicesTableProps> = ({
  invoices,
  fetchInvoices,
  loading,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const showEditModal = (invoice: InvoiceData) => {
    setCurrentInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const filteredInvoices = useMemo(() => {
    if (!searchText) return invoices;

    return invoices.filter((invoice) =>
      Object.values(invoice).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [invoices, searchText]);

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

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      fetchInvoices();
    } catch {
      message.error("Delete failed");
    }
  };

  const getMenuItems = (record: InvoiceData): MenuProps["items"] => [
    {
      key: "edit",
      label: (
        <Button
          icon={<MdEdit />}
          onClick={() => showEditModal(record)}
          type="link"
        >
          Edit
        </Button>
      ),
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title={`Delete ${record.invoice_id}?`}
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger>
            <MdDelete />
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

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
    {
      title: "Action",
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={["click"]}>
          <Button>Options</Button>
        </Dropdown>
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
            className="border text-[14px] w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <InvoicesReportButton invoices={invoices} />
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

      <EditInvoicesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentInvoice={currentInvoice}
        onSave={handleEditSubmit}
      />
    </main>
  );
};
