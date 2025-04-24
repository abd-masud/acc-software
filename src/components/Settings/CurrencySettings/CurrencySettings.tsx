import { Breadcrumb } from "./Breadcrumb";
import { CurrencySettingsTable } from "./CurrencySettingsTable";

export const CurrencySettingsComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <CurrencySettingsTable />
    </main>
  );
};
