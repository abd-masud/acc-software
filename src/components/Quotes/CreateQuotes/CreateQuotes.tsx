"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb } from "./Breadcrumb";
import { CreateQuotesForm } from "./CreateQuotesForm";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const CreateQuotesComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <CreateQuotesForm />
    </main>
  );
};
