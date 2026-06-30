export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface VerificationDocuments {
  idFront: string
  idBack: string
  portrait: string
  certificate?: string
}

export interface VerificationRequest {
  id: string
  technicianId: string
  fullName: string
  phone: string
  email: string
  district: string
  serviceCategory: string
  yearsExperience: number
  submittedAt: string
  status: VerificationStatus
  note?: string
  reviewedAt?: string
  reviewedBy?: string
  documents: VerificationDocuments
}
