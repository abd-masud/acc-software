import { Customers } from "./customers";
import { Products } from "./products";

export type InvoiceItem = {
    id: number;
    product_id: string;
    product: string;
    quantity: number;
    unit_price: number;
    unit: string;
    amount: number;
};

export type InvoiceData = {
    id: number;
    customer: Customers;
    items: InvoiceItem[];
    invoice_id: string;
    date: string;
    due_date: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paid_amount: number;
    due_amount: number;
    notes: string;
    user_id?: number;
};

export interface InvoiceApiResponse {
    success: boolean;
    data: InvoiceData[];
    message?: string;
}

export interface InvoicesTableProps {
    invoices: InvoiceData[];
    fetchInvoices: () => void;
    loading: boolean;
}

export interface EditInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentInvoice: InvoiceData | null;
    onSave: (updatedInvoice: InvoiceData) => Promise<void>;
}

export interface InvoicesReportButtonProps {
    invoices: InvoiceData[];
}

export interface InvoicesItemProps {
    InvoiceId: number;
}

export type CustomerOption = {
    value: number;
    label: string;
    customer: Customers;
};

export type ProductOption = {
    value: number;
    label: string;
    product: Products;
};

export interface CustomerInvoicesListProps {
    CustomerId: number;
}
