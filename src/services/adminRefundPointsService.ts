import { API_URL, fetchWithAuth } from './auth'

// ===== Types =====
export interface RefundItem {
  code: string
  orderCode: string | null
  customerName: string | null
  technicianName: string | null
  amount: number
  reason: string | null
  method?: string | null
  customerBankName?: string | null
  customerBankAccountNumber?: string | null
  customerBankAccountOwner?: string | null
  status: string
  technicianDebt: boolean
  technicianBalanceAfter: number | null
  technicianLocked: boolean
  createdAt: string
}

export interface RefundOptions {
  method?: 'wallet' | 'bank-transfer'
  customerBankName?: string
  customerBankAccountNumber?: string
  customerBankAccountOwner?: string
}

export interface RefundListResult {
  items: RefundItem[]
  total: number
  page: number
  totalPages: number
}

export interface PointHistoryItem {
  points: number
  balanceAfter: number
  type: string
  note: string | null
  orderCode: string | null
  createdAt: string
}

export interface TechnicianPoints {
  technicianCode: string
  technicianName: string
  rewardPoints: number
  history: PointHistoryItem[]
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  error?: { code?: string; message?: string }
  message?: string
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
    if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này.')
    let message = `Lỗi HTTP ${response.status}`
    try {
      const body = await response.json()
      message = body?.error?.message || body?.message || message
    } catch {
      // ignore parse error
    }
    throw new Error(message)
  }
  const result: ApiEnvelope<T> = await response.json()
  if (!result.success) {
    throw new Error(result.error?.message || result.message || 'Lỗi không xác định')
  }
  return result.data
}

// ===== Refunds =====
export const getRefunds = async (page = 1, size = 10): Promise<RefundListResult> => {
  const response = await fetchWithAuth(`${API_URL}/admin/refunds?page=${page}&size=${size}`)
  const data = await handleResponse<any>(response)
  return {
    items: (data?.items ?? []) as RefundItem[],
    total: data?.pagination?.total ?? 0,
    page: data?.pagination?.page ?? page,
    totalPages: data?.pagination?.totalPages ?? 1,
  }
}

export const createRefund = async (
  orderCode: string,
  amount: number,
  reason: string,
  options: RefundOptions = {},
): Promise<RefundItem> => {
  const response = await fetchWithAuth(`${API_URL}/admin/orders/${encodeURIComponent(orderCode)}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      reason,
      method: options.method ?? 'wallet',
      ...(options.method === 'bank-transfer'
        ? {
            customerBankName: options.customerBankName,
            customerBankAccountNumber: options.customerBankAccountNumber,
            customerBankAccountOwner: options.customerBankAccountOwner,
          }
        : {}),
    }),
  })
  return handleResponse<RefundItem>(response)
}

// ===== Technician points =====
export const getTechnicianPoints = async (technicianCode: string): Promise<TechnicianPoints> => {
  const response = await fetchWithAuth(`${API_URL}/admin/technicians/${encodeURIComponent(technicianCode)}/points`)
  return handleResponse<TechnicianPoints>(response)
}

export const adjustTechnicianPoints = async (
  technicianCode: string,
  points: number,
  reason: string,
): Promise<TechnicianPoints> => {
  const response = await fetchWithAuth(
    `${API_URL}/admin/technicians/${encodeURIComponent(technicianCode)}/points`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points, reason }),
    },
  )
  return handleResponse<TechnicianPoints>(response)
}
