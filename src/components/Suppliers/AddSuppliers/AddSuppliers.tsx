"use client";

import { Breadcrumb } from "./Breadcrumb";
import { AddSuppliersForm } from "./AddSuppliersForm";
import { useAccUserRedirect } from "@/hooks/useAccUser";
import { useAuth } from "@/contexts/AuthContext";

export const AddSuppliersComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <AddSuppliersForm />
    </main>
  );
};
