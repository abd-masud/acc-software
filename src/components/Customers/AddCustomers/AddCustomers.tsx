"use client";

import { Breadcrumb } from "./Breadcrumb";
import { AddCustomersForm } from "./AddCustomersForm";
import { useAccUserRedirect } from "@/hooks/useAccUser";
import { useAuth } from "@/contexts/AuthContext";

export const AddCustomersComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <AddCustomersForm />
    </main>
  );
};
