import { HomeHeader } from "./Header";
import { MetricsCards } from "./MetricsCards";
import { QuickActions } from "./QuickActions";
import { ProductOverview } from "./ProductOverview";
import { FinancialOverview } from "./FinancialOverview";

export const HomeComponent = () => {
  return (
    <main className="bg-gray-50 min-h-[calc(100vh-70px)] p-6">
      <HomeHeader />
      <MetricsCards />
      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductOverview />
        <FinancialOverview />
      </div>
    </main>
  );
};
