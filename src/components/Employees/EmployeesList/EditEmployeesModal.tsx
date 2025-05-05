"use client";

import { Modal, message } from "antd";
import { EditEmployeeModalProps } from "@/types/employees";
import { useCallback, useEffect, useId, useState } from "react";
import { hash } from "bcryptjs";
import { useAuth } from "@/contexts/AuthContext";
import { StylesConfig } from "react-select";
import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => <div className="h-[38px] w-full rounded border" />,
});

interface SelectOption {
  label: string;
  value: string;
}

interface GeneralOptions {
  department: string[];
  role: string[];
  status: string[];
}

export const EditEmployeesModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  currentEmployee,
  onSave,
}) => {
  const instanceId = useId();
  const { user } = useAuth();
  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [generalOptions, setGeneralOptions] = useState<GeneralOptions>({
    department: [],
    role: [],
    status: [],
  });

  const fetchGenerals = useCallback(async () => {
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers["user_id"] = user.id.toString();
      }

      const response = await fetch("/api/generals", {
        method: "GET",
        headers,
      });
      const json: any = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch customers");
      }

      const optionsData = json.data[0] || {};
      setGeneralOptions({
        department: optionsData.department || [],
        role: optionsData.role || [],
        status: optionsData.status || [],
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGenerals();
  }, [fetchGenerals]);

  const toSelectOptions = (arr: string[] | undefined): SelectOption[] => {
    return (arr || []).map((item) => ({ label: item, value: item }));
  };

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

  const generalSelectStyles: StylesConfig<any, false> = {
    control: (base) => ({
      ...base,
      borderColor: "#E5E7EB",
      "&:hover": {
        borderColor: "#E5E7EB",
      },
      minHeight: "48px",
      fontSize: "14px",
      boxShadow: "none",
      backgroundColor: "#F2F4F7",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "14px",
      backgroundColor: state.isSelected ? "#F2F4F7" : "white",
      color: "black",
      "&:hover": {
        backgroundColor: "#F2F4F7",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
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
          <Select
            instanceId={`${instanceId}-department`}
            inputId="department"
            className="mt-2"
            options={toSelectOptions(generalOptions.department)}
            value={toSelectOptions(generalOptions.department).find(
              (opt) => opt.value === department
            )}
            onChange={(selected) =>
              setDepartment((selected as SelectOption)?.value || "")
            }
            placeholder="Select Department"
            styles={generalSelectStyles}
            isClearable
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="role">
            Role
          </label>
          <Select
            instanceId={`${instanceId}-role`}
            inputId="role"
            className="mt-2"
            options={toSelectOptions(generalOptions.role)}
            value={toSelectOptions(generalOptions.role).find(
              (opt) => opt.value === role
            )}
            onChange={(selected) =>
              setRole((selected as SelectOption)?.value || "")
            }
            placeholder="Select Role"
            styles={generalSelectStyles}
            isClearable
          />
        </div>

        <div className="mb-4">
          <label className="text-[14px]" htmlFor="status">
            Status
          </label>
          <Select
            instanceId={`${instanceId}-status`}
            inputId="status"
            className="mt-2"
            options={toSelectOptions(generalOptions.status)}
            value={toSelectOptions(generalOptions.status).find(
              (opt) => opt.value === status
            )}
            onChange={(selected) =>
              setStatus((selected as SelectOption)?.value || "")
            }
            placeholder="Select Status"
            styles={generalSelectStyles}
            isClearable
          />
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
