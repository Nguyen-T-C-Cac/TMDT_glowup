export interface CompletedOrder {
    id: string;
    serviceName: string;
    subService: string;
    customerName: string;
    technicianName: string;
    completionDate: string;
    totalPrice: number;
    rating: number;
    reviewed?: boolean;
}