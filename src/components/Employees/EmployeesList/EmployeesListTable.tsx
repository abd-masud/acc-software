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
import { Employees, EmployeesTableProps } from "@/types/employees";
import { EmployeesReportButton } from "./EmployeesReport";
import { EditEmployeesModal } from "./EditEmployeesModal";

export const EmployeesListTable: React.FC<EmployeesTableProps> = ({
  employees,
  fetchEmployees,
  loading,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employees | null>(
    null
  );
  const [searchText, setSearchText] = useState("");

  const showEditModal = (employee: Employees) => {
    setCurrentEmployee(employee);
    setIsEditModalOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    if (!searchText) return employees;

    return employees.filter((employee) =>
      Object.values(employee).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [employees, searchText]);

  const handleEditSubmit = async (updatedEmployee: Employees) => {
    try {
      const response = await fetch("/api/employees", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEmployee),
      });

      if (!response.ok) {
        throw new Error("Failed to update employee");
      }

      message.success("Employee updated successfully");
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      message.error("Update failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("/api/employees", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      fetchEmployees();
    } catch {
      message.error("Delete failed");
    }
  };

  const getMenuItems = (record: Employees): MenuProps["items"] => [
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

  const columns: TableColumnsType<Employees> = [
    {
      title: "#",
      width: "40px",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Contact Number",
      dataIndex: "contact",
    },
    {
      title: "Department",
      dataIndex: "department",
    },
    {
      title: "Role",
      dataIndex: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
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
          <h2 className="text-[13px] font-[500]">Employees Info</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Input
            type="text"
            placeholder="Search..."
            className="border text-[14px] w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <EmployeesReportButton employees={filteredEmployees} />
        </div>
      </div>
      <Table
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={filteredEmployees}
        loading={loading}
        bordered
        rowKey="id"
      />

      <EditEmployeesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentEmployee={currentEmployee}
        onSave={handleEditSubmit}
      />
    </main>
  );
};
