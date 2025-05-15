"use client";

import { HomeHeader } from "./Header";
import { MetricsCards } from "./MetricsCards";
import { QuickActions } from "./QuickActions";
import { useAuth } from "@/contexts/AuthContext";
import { useAccUserRedirect } from "@/hooks/useAccUser";
import { Overviews } from "./Overviews";

export const HomeComponent = () => {
  const { user } = useAuth();

  useAccUserRedirect();
  if (!user) return null;

  return (
    <main className="bg-gray-50 min-h-[calc(100vh-70px)] p-6">
      <HomeHeader />
      <MetricsCards />
      {user.role?.toLocaleLowerCase() == "admin" && <QuickActions />}
      <Overviews />
    </main>
  );
};
