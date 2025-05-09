export type Products = {
    key: string;
    id: number;
    product_id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    unit: string;
};

export interface ProductApiResponse {
    success: boolean;
    data: Products[];
    message?: string;
}

export interface ProductsTableProps {
    products: Products[];
    fetchProducts: () => void;
    loading: boolean;
}

export interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProduct: Products | null;
    onSave: (updatedProduct: Products) => Promise<void>;
}

export interface ProductsReportButtonProps {
    products: Products[];
}

