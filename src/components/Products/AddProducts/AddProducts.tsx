import { AddProductsForm } from "./AddProductsForm";
import { Breadcrumb } from "./Breadcrumb";

export const AddProductsComponent = () => {
  return (
    <main className="bg-[#F2F4F7] min-h-[calc(100vh-70px)] p-5">
      <Breadcrumb />
      <AddProductsForm />
    </main>
  );
};
