"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

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

  // Fetch roles + permissions
  useEffect(() => {
    const fetchRolesAndModules = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // 1. Fetch role definitions
        const rolesRes = await fetch("/api/generals", {
          headers: {
            user_id: user.id.toString(),
          },
        });
        const rolesData = await rolesRes.json();
        const allRoles: string[] = rolesData.data[0].role || [];

        // 2. Fetch module access permissions
        const permissionsRes = await fetch("/api/permissions", {
          headers: { user_id: user.id.toString() },
        });
        const permissionsData = await permissionsRes.json();

        // Handle case where no permissions exist yet
        const permissionsList = Array.isArray(permissionsData.data)
          ? permissionsData.data
          : [];

        // 3. Build module access structure
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

        // 4. Set basic role info
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

  const toggleModule = (roleName: string, moduleId: string) => {
    setRoleModules((prev) => {
      const updated = { ...prev };
      updated[roleName] = updated[roleName].map((mod) =>
        mod.id == moduleId ? { ...mod, canView: !mod.canView } : mod
      );
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

  return (
    <div className="bg-gray-100 min-h-screen mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-lg shadow-md p-6 divide-y"
          >
            <h3 className="text-lg font-semibold mb-2">{role.name}</h3>
            <div className="space-y-2 pt-3">
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
        ))}
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
