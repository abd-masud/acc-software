"use client";

import { Table, TableColumnsType, Button, message, Input, Modal } from "antd";
import React, { useMemo, useState } from "react";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { Employees, EmployeesTableProps } from "@/types/employees";
// import { EmployeesReportButton } from "./EmployeesReport";
import { EditEmployeesModal } from "./EditEmployeesModal";
import { FaEdit } from "react-icons/fa";

export const EmployeesListTable: React.FC<EmployeesTableProps> = ({
  employees,
  fetchEmployees,
  loading,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employees | null>(
    null
  );
  const [employeeToDelete, setEmployeeToDelete] = useState<Employees | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const showEditModal = (employee: Employees) => {
    setCurrentEmployee(employee);
    setIsEditModalOpen(true);
  };

  const showDeleteModal = (customer: Employees) => {
    setEmployeeToDelete(customer);
    setDeleteConfirmationText("");
    setIsDeleteModalOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    const sortedEmployees = [...employees].sort((a, b) => {
      return b.id - a.id;
    });
    if (!searchText) return sortedEmployees;

    return sortedEmployees.filter((employee) =>
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

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const response = await fetch("/api/employees", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: employeeToDelete.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      message.success("Customer deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteConfirmationText("");
      fetchEmployees();
    } catch {
      message.error("Delete failed");
    }
  };

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
        <div className="flex justify-center items-center gap-2">
          <button
            className="text-white text-[14px] bg-blue-500 hover:bg-blue-600 h-6 w-6 rounded transition-colors duration-300 flex justify-center items-center"
            onClick={() => showEditModal(record)}
            title="Edit"
          >
            <FaEdit />
          </button>
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
          <h2 className="text-[13px] font-[500]">Employees Info</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Input
            type="text"
            placeholder="Search..."
            className="border text-[14px] sm:w-40 w-32 py-1 px-[10px] bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {/* <EmployeesReportButton employees={filteredEmployees} /> */}
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

      <Modal
        title="Confirm Delete Employee"
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
            Delete Employee
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
            Warning: This action will permanently delete the employee record.
          </p>
        </div>
      </Modal>
    </main>
  );
};
