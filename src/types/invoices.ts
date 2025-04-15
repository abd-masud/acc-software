import { Customers } from "./customers";

export type InvoiceItem = {
    id: number;
    product_id: number;
    product: string;
    quantity: number;
    unit_price: number;
    unit: string;
    tax_rate: number;
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
    total_tax: number;
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