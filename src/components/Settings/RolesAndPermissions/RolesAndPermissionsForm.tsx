"use client";

import { useAuth } from "@/contexts/AuthContext";
import { EmployeeApiResponse, Employees } from "@/types/employees";
import { useCallback, useEffect, useState } from "react";
import { Table, TableColumnsType } from "antd";

type Permissions = {
  id: string;
  name: string;
};

type ModulePermission = {
  id: string;
  name: string;
  canView: boolean;
};

type PermissionResponse = {
  role: string;
  allowedModules: string[];
};

const SIDEBAR_MODULES = [
  "customers",
  "invoices",
  "quotes",
  "products",
  "employees",
  "sales-report",
  "stock-manage",
  "settings",
];

export const RolesAndPermissionsForm = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Permissions[]>([]);
  const [roleModules, setRoleModules] = useState<
    Record<string, ModulePermission[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [employeesData, setEmployeesData] = useState<Employees[]>([]);

  useEffect(() => {
    const fetchRolesAndModules = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        const rolesRes = await fetch("/api/generals", {
          headers: {
            user_id: user.id.toString(),
          },
        });
        const rolesData = await rolesRes.json();
        const allRoles: string[] = rolesData.data[0].role || [];

        const permissionsRes = await fetch("/api/permissions", {
          headers: { user_id: user.id.toString() },
        });
        const permissionsData = await permissionsRes.json();

        const permissionsList = Array.isArray(permissionsData.data)
          ? permissionsData.data
          : [];

        const modulesByRole: Record<string, ModulePermission[]> = {};

        allRoles.forEach((roleName) => {
          const roleAccess = permissionsList.find(
            (p: PermissionResponse) => p.role == roleName
          ) || {
            role: roleName,
            allowedModules: [],
          };

          modulesByRole[roleName] = SIDEBAR_MODULES.map((module, idx) => ({
            id: idx.toString(),
            name: module,
            canView: roleAccess.allowedModules.includes(module),
          }));
        });

        setRoleModules(modulesByRole);

        setRoles(
          allRoles.map((name, id) => ({
            id: id.toString(),
            name,
          }))
        );
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    fetchRolesAndModules();
  }, [user?.id]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers["user_id"] = user.id.toString();
      }

      const response = await fetch("/api/employees", {
        method: "GET",
        headers,
      });

      const json: EmployeeApiResponse = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch employees");
      }

      setEmployeesData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const toggleModule = (roleName: string, moduleId: string) => {
    setRoleModules((prev) => {
      const updated = { ...prev };
      updated[roleName] = updated[roleName].map((mod) =>
        mod.id == moduleId ? { ...mod, canView: !mod.canView } : mod
      );
      return updated;
    });
  };

  const toggleAllModules = (roleName: string, checked: boolean) => {
    setRoleModules((prev) => {
      const updated = { ...prev };
      updated[roleName] = updated[roleName].map((mod) => ({
        ...mod,
        canView: checked,
      }));
      return updated;
    });
  };

  const saveAllPermissions = async () => {
    if (!initialLoadComplete) return;

    const payload = Object.keys(roleModules).map((roleName) => ({
      role: roleName,
      allowedModules: roleModules[roleName]
        .filter((mod) => mod.canView)
        .map((mod) => mod.name),
    }));

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (user?.id) {
        headers["user_id"] = user.id.toString();
      }

      const res = await fetch(`/api/permissions`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
      } else {
      }
    } catch (err) {
      console.error("Error saving permissions", err);
    }
  };

  if (!initialLoadComplete) {
    return (
      <div className="bg-gray-100 min-h-screen mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md w-full h-[313px]"></div>
          <div className="bg-white rounded-lg shadow-md w-full h-[313px]"></div>
          <div className="bg-white rounded-lg shadow-md w-full h-[313px]"></div>
          <div className="bg-white rounded-lg shadow-md w-full h-[313px]"></div>
          <div className="bg-white rounded-lg shadow-md w-full h-[313px]"></div>
          <div className="bg-white rounded-lg shadow-md w-full h-[313px]"></div>
        </div>
      </div>
    );
  }

  const filteredRoles =
    selectedRoleFilter === "all"
      ? roles
      : roles.filter((role) => role.name === selectedRoleFilter);

  const getEmployeesByRole = (roleName: string) => {
    return employeesData.filter((employee) => employee.role === roleName);
  };

  const employeeColumns: TableColumnsType<Employees> = [
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
      title: "Email Address",
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
  ];

  return (
    <div className="bg-gray-100 min-h-screen mt-4">
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="filter-all"
              name="role-filter"
              value="all"
              checked={selectedRoleFilter === "all"}
              onChange={() => setSelectedRoleFilter("all")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="filter-all" className="ml-2 text-sm text-gray-700">
              Show All
            </label>
          </div>

          {roles.map((role) => (
            <div key={role.id} className="flex items-center">
              <input
                type="radio"
                id={`filter-${role.name}`}
                name="role-filter"
                value={role.name}
                checked={selectedRoleFilter === role.name}
                onChange={() => setSelectedRoleFilter(role.name)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`filter-${role.name}`}
                className="ml-2 capitalize text-sm text-gray-700"
              >
                {role.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {selectedRoleFilter !== "all" && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Employees with {selectedRoleFilter} role
          </h3>
          <Table
            scroll={{ x: "max-content" }}
            columns={employeeColumns}
            dataSource={getEmployeesByRole(selectedRoleFilter)}
            rowKey="id"
            pagination={false}
            bordered
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredRoles.map((role) => {
          const allChecked = roleModules[role.name]?.every(
            (mod) => mod.canView
          );
          const someChecked = roleModules[role.name]?.some(
            (mod) => mod.canView
          );

          return (
            <div
              key={role.id}
              className="bg-white rounded-lg shadow-md px-6 py-3 divide-y"
            >
              <h3 className="text-lg font-semibold mb-2">{role.name}</h3>
              <div className="pt-3 grid xl:grid-cols-9 sm:grid-cols-3 grid-cols-1 gap-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) =>
                      toggleAllModules(role.name, e.target.checked)
                    }
                    id={`permit-all-${role.name}`}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someChecked && !allChecked;
                      }
                    }}
                  />
                  <label
                    htmlFor={`permit-all-${role.name}`}
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Permit All
                  </label>
                </div>

                {roleModules[role.name]?.map((mod) => (
                  <div key={mod.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={mod.canView}
                      onChange={() => toggleModule(role.name, mod.id)}
                      id={`mod-${role.name}-${mod.id}`}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`mod-${role.name}-${mod.id}`}
                      className="ml-2 capitalize text-sm font-medium text-gray-700"
                    >
                      {mod.name.replace(/-/g, " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {roles.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={saveAllPermissions}
            disabled={loading}
            className="text-[14px] font-[500] py-2 px-3 rounded cursor-pointer transition-all duration-300 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}
    </div>
  );
};
