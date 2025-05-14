"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Employees } from "@/types/employees";
import { SMTPSettings } from "@/types/smtp";
import { Modal } from "antd";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useId, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { StylesConfig } from "react-select";
import success from "../../../../public/images/success.png";
import Image from "next/image";
import Link from "next/link";

const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => <div className="h-[38px] w-full rounded border" />,
});

export const AddEmployeesForm = () => {
  const instanceId = useId();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employee_id, setEmployeeId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<Omit<Employees, "id">>({
    key: "",
    employee_id: "",
    name: "",
    email: "",
    contact: "",
    department: "",
    role: "",
    status: "",
    password: "",
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

  useEffect(() => {
    const generateEmployeeId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 2).toUpperCase()
        : "CO";
      const random = Math.floor(10000 + Math.random() * 90000);
      return `E${compPrefix}${random}`;
    };

    setEmployeeId(generateEmployeeId());
  }, [user]);

  const [generalOptions, setGeneralOptions] = useState<{
    department: string[];
    role: string[];
  }>({ department: [], role: [] });

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const toSelectOptions = (arr: string[] | undefined) => {
    return (arr || []).map((item) => ({ label: item, value: item }));
  };

  const handleSelectChange =
    (field: keyof typeof formValues) => (selected: any) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: selected?.value || "",
      }));
    };

  const sendEmployeeCredentials = async (
    employeeData: Omit<Employees, "id">
  ) => {
    try {
      const emailContent = `
      <html>
        <body>
          <h2>Welcome to ${formData?.company || user?.company}</h2>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <table cellpadding="1" cellspacing="0">
            <tr>
              <td>Name</td>
              <td>:</td>
              <td>${employeeData.name} (${employee_id})</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>:</td>
              <td>${employeeData.email}</td>
            </tr>
            <tr>
              <td>Password</td>
              <td>:</td>
              <td>${employeeData.password}</td>
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formValues,
      user_id: user?.id,
      employee_id: employee_id,
    };

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("This email already exists");
      }
      const hasSMTPSettings =
        formData.host && formData.username && formData.password;
      if (hasSMTPSettings && formValues.email) {
        try {
          await sendEmployeeCredentials(formValues);
        } catch (emailError) {
          console.error(
            "Error sending email (but employee was created):",
            emailError
          );
        }
      }
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating employee:", error);
      setUserMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
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

  if (loading) {
    return <div>Loading form...</div>;
  }

  const handleOkay = () => {
    setShowSuccessModal(false);
    router.push("/employees/employees-list");
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      {userMessage && (
        <div className="left-1/2 top-10 transform -translate-x-1/2 fixed z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-red-400 border-2 border-red-400 mx-auto">
            <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {userMessage}
            </div>
            <button
              onClick={handleCloseMessage}
              className="ml-3 focus:outline-none hover:text-red-300"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#E3E4EA] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Add Employee Form</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="employee_id">
              Employee ID
            </label>
            <input
              placeholder="Enter employee id"
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="employee_id"
              value={employee_id}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="name">
              Name
            </label>
            <input
              placeholder="Enter employee name"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="name"
              value={formValues.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="email">
              Email Address
            </label>
            <input
              placeholder="Enter email address"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="email"
              id="email"
              value={formValues.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="contact">
              Contact Number
            </label>
            <input
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
              id="contact"
              minLength={11}
              maxLength={11}
              value={formValues.contact}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label className="text-[14px]" htmlFor="department">
                Department
              </label>
              <Link
                className="text-[12px] text-blue-600"
                href={"/employees/employee-settings"}
              >
                Add Department
              </Link>
            </div>
            <Select
              instanceId={`${instanceId}-department`}
              inputId="department"
              className="mt-2"
              options={toSelectOptions(generalOptions.department)}
              value={toSelectOptions(generalOptions.department).find(
                (opt) => opt.value == formValues.department
              )}
              onChange={handleSelectChange("department")}
              placeholder="Select Department"
              styles={generalSelectStyles}
              isClearable
              required
            />
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label className="text-[14px]" htmlFor="role">
                Role
              </label>
              <Link
                className="text-[12px] text-blue-600"
                href={"/employees/employee-settings"}
              >
                Add Role
              </Link>
            </div>
            <Select
              instanceId={`${instanceId}-role`}
              inputId="role"
              className="mt-2"
              options={toSelectOptions(generalOptions.role)}
              value={toSelectOptions(generalOptions.role).find(
                (opt) => opt.value == formValues.role
              )}
              onChange={handleSelectChange("role")}
              placeholder="Select Role"
              styles={generalSelectStyles}
              isClearable
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="status">
              Status
            </label>
            <Select
              instanceId={`${instanceId}-status`}
              inputId="status"
              className="mt-2"
              options={statusOptions}
              value={statusOptions.find(
                (opt) => opt.value === formValues.status
              )}
              onChange={handleSelectChange("status")}
              placeholder="Select Status"
              styles={generalSelectStyles}
              isClearable
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-[14px]" htmlFor="password">
              Password
            </label>
            <input
              placeholder="Enter password"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="password"
              id="password"
              value={formValues.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="text-[14px] font-[500] py-2 w-40 rounded cursor-pointer transition-all duration-300 mt-4 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </div>
      </form>
      <Modal
        open={showSuccessModal}
        onCancel={handleOkay}
        footer={[
          <button
            key="okay"
            onClick={handleOkay}
            className="text-[14px] font-[500] py-2 w-20 rounded cursor-pointer transition-all duration-300 mt-2 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          >
            Okay
          </button>,
        ]}
        centered
        width={400}
      >
        <div className="flex flex-col items-center pt-5">
          <Image src={success} alt="Success" width={80} height={80} />
          <h3 className="text-xl font-semibold mt-2">Success!</h3>
          <p className="text-gray-600 text-center">
            Employee has been added successfully.
          </p>
        </div>
      </Modal>
    </main>
  );
};
