import { Breadcrumb } from "./Breadcrumb";
import { CreateInvoiceForm } from "./CreateInvoiceForm";

export const CreateInvoiceComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <CreateInvoiceForm />
    </main>
  );
};
