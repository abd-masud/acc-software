import { Breadcrumb } from "./Breadcrumb";
import { AddCustomersForm } from "./AddCustomersForm";

export const AddCustomersComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <AddCustomersForm />
    </main>
  );
};
