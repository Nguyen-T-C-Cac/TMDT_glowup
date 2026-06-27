export interface DeviceType {
    code: string;
    name: string;
    categoryCode: string;
}

export interface Brand {
    code: string;
    name: string;
    categoryCode: string;
}

export interface BookingResponse {
    id: string;
    code: string;
    categoryCode: string;
    categoryName: string;
    deviceTypeCode?: string;
    deviceTypeName?: string;
    brandCode?: string;
    brandName?: string;
    customerCode: string;
    customerName: string;
    technicianCode: string;
    technicianName: string;
    description: string;
    urgency: string;
    scheduledDate?: string;
    preferredTime?: string;
    address: string;
    phone?: string;
    status: string;
    conversationId?: string;
    imageUrls?: string[];
    createdAt: string;
}

export interface BookingSubmitResponse {
    booking: BookingResponse;
    conversationId: string;
    partner?: {
        id: string;
        fullName: string;
        avatar?: string | null;
    };
}

export interface CreateBookingPayload {
    categoryCode: string;
    deviceTypeCode?: string;
    brandCode?: string;
    technicianCode?: string;
    description: string;
    urgency?: string;
    scheduledDate?: string;
    preferredTime?: string;
    address: string;
    phone?: string;
    imageUrls?: string[];
}

export interface EmbeddedBooking {
    id: string;
    code: string;
    categoryName: string;
    deviceTypeName?: string;
    brandName?: string;
    customerName?: string;
    technicianName?: string;
    description?: string;
    urgency?: string;
    scheduledDate?: string;
    preferredTime?: string;
    address?: string;
    phone?: string;
    status?: string;
    imageUrls?: string[];
}
