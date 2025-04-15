import { Breadcrumb } from "./Breadcrumb";
import { SMTPSettingsForm } from "./SMTPSettingsForm";

export const SMTPSettingsComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <SMTPSettingsForm />
    </main>
  );
};
