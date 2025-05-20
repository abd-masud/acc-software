"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb } from "./Breadcrumb";
import { CreateInvoicesForm } from "./CreateInvoicesForm";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const CreateInvoicesComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <CreateInvoicesForm />
    </main>
  );
};
