import { Breadcrumb } from "./Breadcrumb";
import { CreateInvoicesForm } from "./CreateInvoicesForm";

export const CreateInvoicesComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <CreateInvoicesForm />
    </main>
  );
};
