"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/StockMaster/Warehouse/Cabinet/Breadcrumb";
import { CabinetItemComponent } from "@/components/StockMaster/Warehouse/Cabinet/Cabinet";

export default function Warehouse() {
  const pathname = usePathname();
  const [cabinetId, setCabinetId] = useState<string | null>(null);

  useEffect(() => {
    if (pathname) {
      const parts = pathname.split("/");
      const extractedId = parts[parts.length - 1];
      setCabinetId(extractedId);
    }
  }, [pathname]);

  if (!cabinetId)
    return (
      <main className="bg-[#f8fafc] min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          loading...
        </div>
      </main>
    );

  return <CabinetItemComponent cabinetId={cabinetId} />;
}
