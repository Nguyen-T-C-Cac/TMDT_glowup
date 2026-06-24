import { API_URL, fetchWithAuth } from './auth'

type ApiResponse<T> = {
  success: boolean
  data: T
}

export type NotificationItem = {
  id: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: string
}

export type NotificationListData = {
  unreadCount: number
  items: NotificationItem[]
}

export const getMyNotifications = async (
  page = 1,
  limit = 10
): Promise<NotificationListData> => {
  const response = await fetchWithAuth(
    `${API_URL}/notifications?page=${page}&limit=${limit}`
  )
  const payload = (await response.json()) as ApiResponse<NotificationListData>

  if (!response.ok || !payload.success) {
    throw new Error('Không thể tải thông báo')
  }

  return payload.data
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
  })
  const payload = (await response.json()) as ApiResponse<unknown>

  if (!response.ok || !payload.success) {
    throw new Error('Không thể đánh dấu đã đọc')
  }
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const response = await fetchWithAuth(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
  })
  const payload = (await response.json()) as ApiResponse<unknown>

  if (!response.ok || !payload.success) {
    throw new Error('Không thể đánh dấu tất cả đã đọc')
  }
}

export type SendAdminNotificationPayload = {
  title: string
  body: string
  recipientCodes: string[]
  type?: string
}

export const sendAdminNotification = async (
  payload: SendAdminNotificationPayload
): Promise<void> => {
  const response = await fetchWithAuth(`${API_URL}/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const parsed = (await response.json()) as ApiResponse<unknown>

  if (!response.ok || !parsed.success) {
    throw new Error('Không thể gửi thông báo')
  }
}

export const getNotificationById = async (
  id: string
): Promise<NotificationItem> => {
  const response = await fetchWithAuth(`${API_URL}/notifications/${id}`)
  const parsed = (await response.json()) as ApiResponse<NotificationItem>

  if (!response.ok || !parsed.success) {
    throw new Error('Không thể tải thông báo')
  }

  return parsed.data
}
