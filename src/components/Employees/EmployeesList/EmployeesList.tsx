"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { EmployeesListTable } from "./EmployeesListTable";
import { Employees, EmployeeApiResponse } from "@/types/employees";
import { useAuth } from "@/contexts/AuthContext";

export const EmployeesListComponent = () => {
  const { user } = useAuth();
  const [employeesData, setEmployeesData] = useState<Employees[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <EmployeesListTable
        employees={employeesData}
        fetchEmployees={fetchEmployees}
        loading={loading}
      />
    </main>
  );
};
