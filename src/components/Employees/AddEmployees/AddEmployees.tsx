import { AddEmployeesForm } from "./AddEmployeesForm";
import { Breadcrumb } from "./Breadcrumb";

export const AddEmployeesComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <AddEmployeesForm />
    </main>
  );
};
