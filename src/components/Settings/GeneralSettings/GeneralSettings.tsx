import { Breadcrumb } from "./Breadcrumb";
import { GeneralSettingsForm } from "./GeneralSettingsForm";

export const GeneralSettingsComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <GeneralSettingsForm />
    </main>
  );
};
