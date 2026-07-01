export type WarrantyStatus = 'pending' | 'in-progress' | 'completed' | 'rejected' | 'expired';

export interface WarrantyResponse {
    id: string;
    orderId: string;
    status: WarrantyStatus;
    description?: string;
    images?: string[];
    scheduledAt?: string;
    warrantyExpiresAt?: string;
    remainingDays?: number;
    rejectReason?: string;
    technician?: {
        id: string;
        fullName: string;
        phone?: string;
        avatar?: string;
    };
    previousRejectedClaim?: PreviousWarrantyClaimResponse;
    createdAt: string;
}

export interface PreviousWarrantyClaimResponse {
    id: string;
    description?: string;
    images?: string[];
    scheduledAt?: string;
    rejectReason?: string;
    createdAt?: string;
}

export interface CreateWarrantyPayload {
    description: string;
    images?: string[];
    scheduledAt?: string;
}

export interface EmbeddedWarranty {
    event: 'warranty_request' | 'warranty_accepted' | 'warranty_rejected';
    warrantyId: string;
    description?: string;
    images?: string[];
    scheduledAt?: string;
    warrantyExpiresAt?: string;
    customerName?: string;
    technicianName?: string;
    note?: string;
    rejectReason?: string;
}
