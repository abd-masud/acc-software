"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/StockMaster/Warehouse/Cabinet/Store/Breadcrumb";
import { StoreListComponent } from "@/components/StockMaster/Warehouse/Cabinet/Store/StoreList";

export default function Store() {
  const pathname = usePathname();
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (pathname) {
      const parts = pathname.split("/");
      const extractedId = parts[parts.length - 1];
      setStoreId(extractedId);
    }
  }, [pathname]);

  if (!storeId)
    return (
      <main className="bg-[#f8fafc] min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          loading...
        </div>
      </main>
    );

  return <StoreListComponent storeId={storeId} />;
}
