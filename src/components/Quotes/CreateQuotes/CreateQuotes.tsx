import { Breadcrumb } from "./Breadcrumb";
import { CreateQuotesForm } from "./CreateQuotesForm";

export const CreateQuotesComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <CreateQuotesForm />
    </main>
  );
};
