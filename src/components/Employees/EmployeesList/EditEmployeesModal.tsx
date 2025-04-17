"use client";

import { Modal, message } from "antd";
import { EditEmployeeModalProps } from "@/types/employees";
import { useEffect, useState } from "react";
import { hash } from "bcryptjs";

export const EditEmployeesModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  currentEmployee,
  onSave,
}) => {
  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentEmployee) {
      setEmployeeName(currentEmployee.name);
      setEmail(currentEmployee.email);
      setContact(currentEmployee.contact);
      setDepartment(currentEmployee.department);
      setRole(currentEmployee.role);
      setStatus(currentEmployee.status);
      // Don't pre-fill password field for security
      setPassword("");
    }
  }, [currentEmployee]);

  const handleSubmit = async () => {
    if (!currentEmployee) return;

    try {
      setLoading(true);

      // Only hash password if it's a new one (not empty)
      const hashedPassword = password
        ? await hash(password, 10)
        : currentEmployee.password;

      const updatedEmployee = {
        ...currentEmployee,
        name: employeeName,
        email,
        contact,
        department,
        role,
        status,
        password: hashedPassword,
      };

      await onSave(updatedEmployee);
      message.success("Employee updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Save"
      okButtonProps={{ loading }}
      cancelButtonProps={{ disabled: loading }}
    >
      <div className="flex items-center pb-3">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Edit Employee</h2>
      </div>

      <div className="mb-4">
        <label className="text-[14px]" htmlFor="employeeName">
          Name
        </label>
        <input
          id="employeeName"
          placeholder="Enter employee name"
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-[14px]" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter employee email"
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="contact">
            Contact Number
          </label>
          <input
            id="contact"
            type="tel"
            placeholder="Enter contact number"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="text-[14px]" htmlFor="department">
            Department
          </label>
          <input
            id="department"
            placeholder="Enter department"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="role">
            Role
          </label>
          <input
            id="role"
            placeholder="Enter role"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="text-[14px]" htmlFor="status">
            Status
          </label>
          <select
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-[14px]" htmlFor="password">
          New Password (leave blank to keep current)
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter new password"
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
    </Modal>
  );
};
