"use client";

import { Breadcrumb } from "./Breadcrumb";
import { AddPurchasersForm } from "./AddPurchasersForm";
import { useAccUserRedirect } from "@/hooks/useAccUser";
import { useAuth } from "@/contexts/AuthContext";

export const AddPurchasersComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <AddPurchasersForm />
    </main>
  );
};
