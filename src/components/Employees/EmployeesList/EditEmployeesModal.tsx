"use client";

import { Modal, message } from "antd";
import { EditEmployeeModalProps, Employees } from "@/types/employees";
import { useCallback, useEffect, useId, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StylesConfig } from "react-select";
import dynamic from "next/dynamic";
import { SMTPSettings } from "@/types/smtp";

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
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [generalOptions, setGeneralOptions] = useState<GeneralOptions>({
    department: [],
    role: [],
    status: [],
  });
  const [formData, setFormData] = useState<SMTPSettings>({
    host: "",
    port: 587,
    username: "",
    password: "",
    encryption: "none",
    email: "",
    company: "",
  });

  const fetchSMTPSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/smtp?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data.length > 0) {
        const smtp = result.data[0];
        setFormData({
          host: smtp.host || "",
          port: smtp.port || 587,
          username: smtp.username || "",
          password: smtp.password || "",
          encryption: smtp.encryption || "none",
          email: smtp.email || "",
          company: smtp.company || "",
        });
      } else {
        console.log(result.message || "No SMTP settings found");
      }
    } catch (error) {
      console.error("Failed to fetch SMTP settings:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSMTPSettings();
  }, [fetchSMTPSettings]);

  const fetchGenerals = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/generals?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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
      setEmployeeId(currentEmployee.employee_id);
      setEmployeeName(currentEmployee.name);
      setEmail(currentEmployee.email);
      setContact(currentEmployee.contact);
      setDepartment(currentEmployee.department);
      setRole(currentEmployee.role);
      setStatus(currentEmployee.status);
    }
  }, [currentEmployee]);

  const sendEmployeeCredentials = async (
    employeeData: Omit<Employees, "id">
  ) => {
    try {
      const emailContent = `
      <html>
        <body>
          <h2>Welcome to ${user?.company || "Our Company"}</h2>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <table cellpadding="1" cellspacing="0">
            <tr>
              <td>Name</td>
              <td>:</td>
              <td>${employeeData.name} (${employeeData.employee_id})</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>:</td>
              <td>${employeeData.email}</td>
            </tr>
            <tr>
              <td>Password</td>
              <td>:</td>
              <td>Unchanged</td>
            </tr>
            <tr>
              <td>Role</td>
              <td>:</td>
              <td>${employeeData.role}</td>
            </tr>
            <tr>
              <td>Department</td>
              <td>:</td>
              <td>${employeeData.department}</td>
            </tr>
          </table>
          <p>Please keep your credentials secure and change your password after first login.</p>
        </body>
      </html>
    `;

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          smtpSettings: formData,
          emailData: {
            to: employeeData.email,
            subject: `Your ${
              formData.company || "Company"
            } Account Credentials`,
            html: emailContent,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!currentEmployee) return;

    try {
      setLoading(true);
      const updatedEmployee = {
        id: currentEmployee.id,
        employee_id: employeeId,
        name: employeeName,
        email,
        contact,
        department,
        role,
        status,
      };

      console.log(updatedEmployee);
      await onSave(updatedEmployee);
      await sendEmployeeCredentials(updatedEmployee);
      message.success("Employee updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  const generalSelectStyles: StylesConfig<any, boolean> = {
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
        <label className="text-[14px]" htmlFor="employeeId">
          Employee ID
        </label>
        <input
          id="employeeId"
          placeholder="Enter employee name"
          className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          value={employeeId}
          readOnly
        />
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
            placeholder="Enter contact number"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            onKeyDown={(e) => {
              if (
                !/[0-9]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "Tab" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight"
              ) {
                e.preventDefault();
              }
            }}
            minLength={11}
            maxLength={11}
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
    </Modal>
  );
};
