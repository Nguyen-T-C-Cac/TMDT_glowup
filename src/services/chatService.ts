import { API_URL, fetchWithAuth } from './auth'

// ---------------------------------------------------------------------------
// Types — mirror the backend chat / quotation DTOs.
// ---------------------------------------------------------------------------

export type QuotationStatus = 'pending' | 'accepted' | 'rejected' | 'expired'
export type MessageKind = 'text' | 'image' | 'quotation' | 'system'

export interface ChatPartner {
  id: string
  fullName: string
  avatar?: string
  isOnline?: boolean
}

export interface LastMessagePreview {
  content?: string
  senderId?: string
  sentAt?: string
}

export interface ConversationListItem {
  id: string
  orderId?: string
  partner?: ChatPartner
  lastMessage?: LastMessagePreview
  unreadCount?: number
  updatedAt?: string
}

export interface EmbeddedQuotation {
  id: string
  serviceName: string
  description?: string
  price: number
  scheduledAt?: string
  status: QuotationStatus
}

export interface ChatMessage {
  id: string
  conversationId?: string
  senderId?: string
  type: MessageKind
  content?: string
  quotation?: EmbeddedQuotation
  sentAt?: string
  isRead?: boolean
}

export interface CreateQuotePayload {
  serviceName: string
  description?: string
  price: number
  /** ISO LocalDateTime, e.g. "2026-06-10T14:00:00", or null when no schedule. */
  scheduledAt?: string | null
  notes?: string
}

export interface AcceptQuoteResult {
  id: string
  status: string
  orderId: string
  acceptedAt?: string
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  error?: { code: string; message: string }
}

interface Paged<T> {
  items: T[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

// ---------------------------------------------------------------------------
// Internal helper — unwrap the standard { success, data, error } envelope.
// ---------------------------------------------------------------------------

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithAuth(`${API_URL}${path}`, init)
  let payload: ApiEnvelope<T>
  try {
    payload = await response.json()
  } catch {
    throw new Error('Phản hồi không hợp lệ từ máy chủ')
  }
  if (!response.ok || !payload.success) {
    throw new Error(payload?.error?.message || 'Yêu cầu thất bại, vui lòng thử lại')
  }
  return payload.data
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export async function listConversations(page = 1, limit = 20): Promise<ConversationListItem[]> {
  const data = await request<Paged<ConversationListItem>>(
    `/conversations?page=${page}&limit=${limit}`,
    { method: 'GET' }
  )
  return data.items ?? []
}

/** Customer-only: open (or reuse) a conversation with a technician. */
export async function createConversation(
  technicianId: string,
  orderId?: string
): Promise<{ id: string; orderId?: string; partner?: ChatPartner }> {
  return request(`/conversations`, {
    method: 'POST',
    body: JSON.stringify({ technicianId, orderId }),
  })
}

/** Messages come back newest-first from the API; we return them oldest-first. */
export async function listMessages(
  conversationId: string,
  page = 1,
  limit = 50
): Promise<ChatMessage[]> {
  const data = await request<Paged<ChatMessage>>(
    `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    { method: 'GET' }
  )
  return [...(data.items ?? [])].reverse()
}

export async function sendTextMessage(
  conversationId: string,
  content: string
): Promise<ChatMessage> {
  return request<ChatMessage>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ type: 'text', content }),
  })
}

// ---------------------------------------------------------------------------
// Quotations
// ---------------------------------------------------------------------------

/** Technician-only: post a quote into the conversation (also writes a chat message). */
export async function createQuote(
  conversationId: string,
  payload: CreateQuotePayload
): Promise<EmbeddedQuotation> {
  return request(`/conversations/${conversationId}/quotes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Customer-only: accept a quote → backend spawns a SCHEDULED order. */
export async function acceptQuote(quotationId: string): Promise<AcceptQuoteResult> {
  return request<AcceptQuoteResult>(`/quotes/${quotationId}/accept`, { method: 'PATCH' })
}

/** Customer-only: reject a pending quote. */
export async function rejectQuote(quotationId: string): Promise<EmbeddedQuotation> {
  return request(`/quotes/${quotationId}/reject`, { method: 'PATCH' })
}
