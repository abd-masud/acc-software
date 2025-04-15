import { Breadcrumb } from "./Breadcrumb";
import { PolicySettingsForm } from "./PolicySettingsForm";

export const PolicySettingsComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <PolicySettingsForm />
    </main>
  );
};
