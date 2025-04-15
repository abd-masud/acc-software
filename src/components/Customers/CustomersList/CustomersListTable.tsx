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
import React, { useState, useMemo } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { Customers, CustomersTableProps } from "@/types/customers";
import { EditCustomerModal } from "./EditCustomerModal";
import { CustomersReportButton } from "./CustomersReport";

export const CustomersListTable: React.FC<CustomersTableProps> = ({
  customers,
  fetchCustomers,
  loading,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customers | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const showEditModal = (customer: Customers) => {
    setCurrentCustomer(customer);
    setIsEditModalOpen(true);
  };

  const filteredCustomers = useMemo(() => {
    if (!searchText) return customers;

    return customers.filter((customer) =>
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
      <div className="flex sm:justify-between justify-end items-center mb-5">
        <div className="sm:flex items-center hidden">
          <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
          <h2 className="text-[13px] font-[500]">Customers Info</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Input
            type="text"
            placeholder="Search..."
            className="border text-[14px] w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <CustomersReportButton customers={filteredCustomers} />
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
    </main>
  );
};
