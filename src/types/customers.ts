export interface Customers {
    key: string;
    id: number;
    name: string;
    delivery: string;
    email: string;
    contact: string;
    remarks: string;
}

export type CustomerApiResponse = {
    success: boolean;
    data: Customers[];
    message?: string;
};

export interface CustomersTableProps {
    customers: Customers[];
    loading: boolean;
    fetchCustomers: () => void;
}

export interface EditCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCustomer: Customers | null;
    onSave: (updatedCustomer: Customers) => Promise<void>;
}

export interface CustomersReportButtonProps {
    customers: Customers[];
}
