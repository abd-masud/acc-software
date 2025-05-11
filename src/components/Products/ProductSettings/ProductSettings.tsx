"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb } from "./Breadcrumb";
import { ProductSettingsForm } from "./ProductSettingsForm";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const ProductSettingsComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <ProductSettingsForm />
    </main>
  );
};
