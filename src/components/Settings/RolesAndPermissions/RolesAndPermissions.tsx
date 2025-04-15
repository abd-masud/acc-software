import { Breadcrumb } from "./Breadcrumb";
import { RolesAndPermissionsForm } from "./RolesAndPermissionsForm";

export const RolesAndPermissionsComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <RolesAndPermissionsForm />
    </main>
  );
};
