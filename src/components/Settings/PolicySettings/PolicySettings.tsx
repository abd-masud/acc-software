"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb } from "./Breadcrumb";
import { PolicySettingsForm } from "./PolicySettingsForm";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const PolicySettingsComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <PolicySettingsForm />
    </main>
  );
};
