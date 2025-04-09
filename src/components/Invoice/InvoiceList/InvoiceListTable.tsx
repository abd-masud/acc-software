"use client";

import {
  Table,
  TableColumnsType,
  Button,
  Dropdown,
  MenuProps,
  Popconfirm,
  message,
} from "antd";
import React, { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { Customers, CustomersTableProps } from "@/types/customers";
import { EditInvoiceModal } from "./EditInvoiceModal";
import { InvoiceReportButton } from "./InvoiceReport";

export const InvoiceListTable: React.FC<CustomersTableProps> = ({
  customers,
  fetchCustomers,
  loading,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customers | null>(
    null
  );

  const showEditModal = (customer: Customers) => {
    setCurrentCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedCustomer: Customers) => {
    try {
      const response = await fetch("/api/customers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCustomer),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      message.success("Customer updated successfully");
      setIsEditModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("/api/customers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      fetchCustomers();
    } catch {
      message.error("Delete failed");
    }
  };

  const getMenuItems = (record: Customers): MenuProps["items"] => [
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
          title={`Delete ${record.name}?`}
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

  const columns: TableColumnsType<Customers> = [
    {
      title: "#",
      width: "40px",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Customer Name",
      dataIndex: "name",
    },
    {
      title: "Delivery Address",
      dataIndex: "delivery",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Contact",
      dataIndex: "contact",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
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
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center">
          <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Customers Info</h2>
        </div>
        <InvoiceReportButton customers={customers} />
      </div>
      <Table
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={customers}
        loading={loading}
        bordered
        rowKey="id"
      />

      <EditInvoiceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentCustomer={currentCustomer}
        onSave={handleEditSubmit}
      />
    </main>
  );
};
