export type Products = {
    key: string;
    id: number;
    product_id: string;
    type: string;
    sku_id: string;
    name: string;
    purchaser: string;
    attribute: string;
    description: string;
    buying_price: string;
    price: string;
    category: string;
    stock: string;
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

