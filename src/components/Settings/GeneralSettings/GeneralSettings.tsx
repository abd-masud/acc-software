"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumb } from "./Breadcrumb";
import { GeneralSettingsForm } from "./GeneralSettingsForm";
import { useAccUserRedirect } from "@/hooks/useAccUser";

export const GeneralSettingsComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <GeneralSettingsForm />
    </main>
  );
};
