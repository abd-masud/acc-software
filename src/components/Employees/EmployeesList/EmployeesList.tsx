"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { EmployeesListTable } from "./EmployeesListTable";
import { Employees, EmployeeApiResponse } from "@/types/employees";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const EmployeesListComponent = () => {
  const { user } = useAuth();
  const [employeesData, setEmployeesData] = useState<Employees[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useAccUserRedirect();

  const fetchEmployees = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/employees?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <EmployeesListTable
        employees={employeesData}
        fetchEmployees={fetchEmployees}
        loading={loading}
      />
    </main>
  );
};
