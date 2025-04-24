import { Customers } from "./customers";

export type QuoteItem = {
    id: number;
    product_id: number;
    product: string;
    quantity: number;
    unit_price: number;
    unit: string;
    tax_rate: number;
    amount: number;
};

export type QuoteData = {
    id: number;
    customer: Customers;
    items: QuoteItem[];
    quote_id: string;
    date: string;
    due_date: string;
    subtotal: number;
    total_tax: number;
    discount: number;
    total: number;
    notes: string;
    user_id?: number;
};

export interface QuoteApiResponse {
    success: boolean;
    data: QuoteData[];
    message?: string;
}

export interface QuotesTableProps {
    quotes: QuoteData[];
    fetchQuotes: () => void;
    loading: boolean;
}

export interface EditQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentQuote: QuoteData | null;
    onSave: (updatedQuote: QuoteData) => Promise<void>;
}

export interface QuotesReportButtonProps {
    quotes: QuoteData[];
}