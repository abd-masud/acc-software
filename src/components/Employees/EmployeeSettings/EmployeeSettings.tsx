"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb } from "./Breadcrumb";
import { EmployeeSettingsForm } from "./EmployeeSettingsForm";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const EmployeeSettingsComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <EmployeeSettingsForm />
    </main>
  );
};
