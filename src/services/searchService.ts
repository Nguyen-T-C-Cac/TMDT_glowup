import apiClient from '../api/config'

export interface CategorySearchResult {
  id: string
  title: string
  description: string
  iconUrl?: string | null
}

export interface TechnicianSearchResult {
  id: string
  fullName: string
  avatar?: string | null
  rating?: number | string | null
  reviewCount?: number | null
  location?: string | null
  district?: string | null
  skills?: string[] | null
  isAvailable?: boolean | null
}

export interface SearchResponse {
  categories: CategorySearchResult[]
  technicians: {
    items: TechnicianSearchResult[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export const searchAll = async (keyword: string, page = 1, limit = 10): Promise<SearchResponse> => {
  const response = await apiClient.get('/api/search', {
    params: { keyword, page, limit },
  })

  const payload = response.data as { success?: boolean; data?: SearchResponse }
  if (!payload || payload.success === false || !payload.data) {
    throw new Error('Không thể tìm kiếm')
  }

  return payload.data
}
