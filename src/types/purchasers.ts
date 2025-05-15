export interface Purchasers {
    key: string;
    id: number;
    purchaser_id: string;
    company: string;
    owner: string;
    address: string;
    email: string;
    contact: string;
}

export type PurchaserApiResponse = {
    success: boolean;
    data: Purchasers[];
    message?: string;
};

export interface PurchasersTableProps {
    purchasers: Purchasers[];
    loading: boolean;
    fetchPurchasers: () => void;
}

export interface EditPurchaserModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPurchaser: Purchasers | null;
    onSave: (updatedPurchaser: Purchasers) => Promise<void>;
}

export interface PurchasersReportButtonProps {
    purchasers: Purchasers[];
}
