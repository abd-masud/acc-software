"use client";

import { Table, TableColumnsType, Modal, message, Input, Button } from "antd";
import React, { useState, useMemo } from "react";
import { Customers, CustomersTableProps } from "@/types/customers";
import { EditCustomerModal } from "./EditCustomerModal";
import { FaEdit } from "react-icons/fa";
import { PiInvoiceBold } from "react-icons/pi";
import { MdOutlineDeleteSweep } from "react-icons/md";
import Link from "next/link";

export const CustomersListTable: React.FC<CustomersTableProps> = ({
  customers,
  fetchCustomers,
  loading,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customers | null>(
    null
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customers | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const showEditModal = (customer: Customers) => {
    setCurrentCustomer(customer);
    setIsEditModalOpen(true);
  };

  const showDeleteModal = (customer: Customers) => {
    setCustomerToDelete(customer);
    setDeleteConfirmationText("");
    setIsDeleteModalOpen(true);
  };

  const filteredCustomers = useMemo(() => {
    const sortedCustomers = [...customers].sort((a, b) => {
      return b.id - a.id;
    });
    if (!searchText) return sortedCustomers;

    return sortedCustomers.filter((customer) =>
      Object.values(customer).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [customers, searchText]);

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

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      const response = await fetch("/api/customers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: customerToDelete.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      message.success("Customer deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteConfirmationText("");
      fetchCustomers();
    } catch {
      message.error("Delete failed");
    }
  };

  const columns: TableColumnsType<Customers> = [
    {
      title: "#",
      width: "40px",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Customer ID",
      dataIndex: "customer_id",
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
      title: "Email Address",
      dataIndex: "email",
    },
    {
      title: "Contact Number",
      dataIndex: "contact",
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   render: (status: string) => {
    //     let color = "";
    //     switch (status) {
    //       case "Unpaid":
    //         color = "red";
    //         break;
    //       case "Paid":
    //         color = "green";
    //         break;
    //       default:
    //         color = "blue";
    //     }
    //     return <span style={{ color }}>{status}</span>;
    //   },
    // },
    {
      title: "Action",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="text-white text-[14px] bg-blue-500 hover:bg-blue-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
            onClick={() => showEditModal(record)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <Link
            className="text-white hover:text-white text-[16px] bg-green-600 hover:bg-green-700 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
            href={`/invoices/customer-invoices/${record.id}`}
            title="Invoice"
          >
            <PiInvoiceBold />
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
          <h2 className="text-[13px] font-[500]">Customers Info</h2>
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
        dataSource={filteredCustomers}
        loading={loading}
        bordered
        rowKey="id"
      />

      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentCustomer={currentCustomer}
        onSave={handleEditSubmit}
      />

      <Modal
        title="Confirm Delete Customer"
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
            Delete Customer
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
            Warning: This action will permanently delete the customer record.
          </p>
        </div>
      </Modal>
    </main>
  );
};
