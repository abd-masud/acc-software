"use client";

import { useState } from "react";

type Permission = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // permission IDs
};

export const RolesAndPermissionsForm = () => {
  // Sample permissions data
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "p1",
      name: "create_content",
      description: "Create new content",
      enabled: false,
    },
    {
      id: "p2",
      name: "edit_content",
      description: "Edit existing content",
      enabled: false,
    },
    {
      id: "p3",
      name: "delete_content",
      description: "Delete content",
      enabled: false,
    },
    {
      id: "p4",
      name: "manage_users",
      description: "Add/edit/remove users",
      enabled: false,
    },
    {
      id: "p5",
      name: "view_analytics",
      description: "View system analytics",
      enabled: false,
    },
    {
      id: "p6",
      name: "configure_system",
      description: "Change system settings",
      enabled: false,
    },
  ]);

  // Sample roles data
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "r1",
      name: "Admin",
      description: "Full system access",
      permissions: ["p1", "p2", "p3", "p4", "p5", "p6"],
    },
    {
      id: "r2",
      name: "Editor",
      description: "Content management",
      permissions: ["p1", "p2"],
    },
    {
      id: "r3",
      name: "Viewer",
      description: "Read-only access",
      permissions: ["p5"],
    },
  ]);

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const togglePermission = (permissionId: string) => {
    setPermissions(
      permissions.map((p) =>
        p.id === permissionId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const handleRolePermissionChange = (roleId: string, permissionId: string) => {
    setRoles(
      roles.map((role) => {
        if (role.id === roleId) {
          const hasPermission = role.permissions.includes(permissionId);
          return {
            ...role,
            permissions: hasPermission
              ? role.permissions.filter((p) => p !== permissionId)
              : [...role.permissions, permissionId],
          };
        }
        return role;
      })
    );
  };

  const handleAddRole = () => {
    if (newRole.name.trim() === "") return;

    const role: Role = {
      id: `r${roles.length + 1}`,
      name: newRole.name,
      description: newRole.description,
      permissions: permissions.filter((p) => p.enabled).map((p) => p.id),
    };

    setRoles([...roles, role]);
    setNewRole({ name: "", description: "", permissions: [] });
    setPermissions(permissions.map((p) => ({ ...p, enabled: false })));
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      <h2 className="text-xl font-semibold mb-6">Roles and Permissions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permissions Section */}
        <section className="border p-4 rounded-lg">
          <h3 className="font-medium mb-4">Available Permissions</h3>
          <div className="space-y-3">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={permission.id}
                  checked={permission.enabled}
                  onChange={() => togglePermission(permission.id)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor={permission.id} className="ml-2 block">
                  <span className="font-medium">{permission.name}</span>
                  <span className="text-gray-500 text-sm block">
                    {permission.description}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Roles Section */}
        <section>
          <div className="border p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-4">Create New Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="e.g. Moderator"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Brief description of the role"
                />
              </div>
              <button
                onClick={handleAddRole}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Role
              </button>
            </div>
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="font-medium mb-4">Existing Roles</h3>
            <div className="space-y-6">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{role.name}</h4>
                      <p className="text-sm text-gray-500">
                        {role.description}
                      </p>
                    </div>
                    <button className="text-red-600 text-sm">Delete</button>
                  </div>
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <div
                        key={`${role.id}-${permission.id}`}
                        className="flex items-center"
                      >
                        <input
                          type="checkbox"
                          id={`${role.id}-${permission.id}`}
                          checked={role.permissions.includes(permission.id)}
                          onChange={() =>
                            handleRolePermissionChange(role.id, permission.id)
                          }
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label
                          htmlFor={`${role.id}-${permission.id}`}
                          className="ml-2 text-sm"
                        >
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
