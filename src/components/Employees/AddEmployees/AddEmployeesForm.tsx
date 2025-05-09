"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Employees } from "@/types/employees";
import { SMTPSettings } from "@/types/smtp";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useId, useState } from "react";
import { StylesConfig } from "react-select";

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
    status: string[];
  }>({ department: [], role: [], status: [] });

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

  const fetchSMTPSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch("/api/smtp", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          user_id: user.id.toString(),
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

      if (res.ok) {
        await sendEmployeeCredentials(formValues);

        setFormValues({
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
        router.push("/employees/employees-list");
      } else {
        console.error("Failed to create employee");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
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

  if (loading) {
    return <div>Loading form...</div>;
  }

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
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
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
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
            <label className="text-[14px]" htmlFor="department">
              Department
            </label>
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
            />
          </div>
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
                (opt) => opt.value == formValues.role
              )}
              onChange={handleSelectChange("role")}
              placeholder="Select Role"
              styles={generalSelectStyles}
              isClearable
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
              options={toSelectOptions(generalOptions.status)}
              value={toSelectOptions(generalOptions.status).find(
                (opt) => opt.value == formValues.status
              )}
              onChange={handleSelectChange("status")}
              placeholder="Select Status"
              styles={generalSelectStyles}
              isClearable
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
    </main>
  );
};
