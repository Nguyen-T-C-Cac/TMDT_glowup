import { API_URL, fetchWithAuth } from './auth'

export interface Technician {
  id: string
  fullName: string
  avatar: string
  rating: number
  reviewCount: number
  location: string
  district: string
  skills: string[]
  pricePerHour: number
  isAvailable: boolean
  timeAvailable?: string
  type?: 'normal' | 'premium'
  titleBadge?: string
  completedJobs: number
  bio?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PagedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/**
 * Lấy danh sách thợ với các bộ lọc
 * @param page - Trang hiện tại (mặc định: 1)
 * @param limit - Số lượng thợ trên trang (mặc định: 10)
 * @param filters - Bộ lọc (service, district, isAvailable, minRating, keyword)
 * @returns Response chứa danh sách thợ và thông tin phân trang
 */
export const getTechnicians = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    service?: string
    district?: string
    isAvailable?: boolean
    minRating?: number
    keyword?: string
  }
): Promise<PagedResponse<Technician>> => {
  try {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    if (filters) {
      if (filters.service) params.append('service', filters.service)
      if (filters.district) params.append('district', filters.district)
      if (filters.isAvailable !== undefined)
        params.append('isAvailable', filters.isAvailable.toString())
      if (filters.minRating) params.append('minRating', filters.minRating.toString())
      if (filters.keyword) params.append('keyword', filters.keyword)
    }

    const response = await fetchWithAuth(
      `${API_URL}/technicians?${params.toString()}`,
      {
        method: 'GET',
      }
    )

    const data: ApiResponse<PagedResponse<Technician>> = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Lấy danh sách thợ thất bại')
    }

    return data.data
  } catch (error) {
    console.error('Error fetching technicians:', error)
    throw error
  }
}

/**
 * Lấy danh sách thợ hàng đầu (rating cao, có nhiều đơn hoàn thành)
 * @param limit - Số lượng thợ cần lấy (mặc định: 10)
 * @returns Danh sách thợ top
 */
export const getTopTechnicians = async (limit: number = 10): Promise<Technician[]> => {
  try {
    const allTechnicians = await getAllTechnicians(undefined, 50)

    const rankedTechnicians = [...allTechnicians].sort((left, right) => {
      const leftIsPremium = left.type === 'premium' || !!left.titleBadge
      const rightIsPremium = right.type === 'premium' || !!right.titleBadge

      if (leftIsPremium !== rightIsPremium) {
        return leftIsPremium ? -1 : 1
      }

      const ratingDiff = Number(right.rating || 0) - Number(left.rating || 0)
      if (ratingDiff !== 0) return ratingDiff

      const completedDiff = Number(right.completedJobs || 0) - Number(left.completedJobs || 0)
      if (completedDiff !== 0) return completedDiff

      return Number(right.reviewCount || 0) - Number(left.reviewCount || 0)
    })

    return rankedTechnicians.slice(0, limit)
  } catch (error) {
    console.error('Error fetching top technicians:', error)
    throw error
  }
}

/**
 * Lấy toàn bộ danh sách thợ bằng cách tự lặp qua các trang của BE.
 * Dùng cho các màn hình cần hiển thị đầy đủ danh sách.
 */
export const getAllTechnicians = async (
  filters?: {
    service?: string
    district?: string
    isAvailable?: boolean
    minRating?: number
    keyword?: string
  },
  pageSize: number = 50
): Promise<Technician[]> => {
  const firstPage = await getTechnicians(1, pageSize, filters)
  const allTechnicians: Technician[] = [...firstPage.items]

  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const nextPage = await getTechnicians(page, pageSize, filters)
    allTechnicians.push(...nextPage.items)
  }

  return allTechnicians
}

/**
 * Tìm kiếm thợ theo từ khóa
 * @param keyword - Từ khóa tìm kiếm (tên, dịch vụ, ...)
 * @param page - Trang hiện tại (mặc định: 1)
 * @param limit - Số lượng kết quả (mặc định: 10)
 * @returns Response chứa kết quả tìm kiếm và thông tin phân trang
 */
export const searchTechnicians = async (
  keyword: string,
  page: number = 1,
  limit: number = 10
): Promise<PagedResponse<Technician>> => {
  try {
    return await getTechnicians(page, limit, { keyword })
  } catch (error) {
    console.error('Error searching technicians:', error)
    throw error
  }
}

/**
 * Lấy danh sách thợ theo dịch vụ
 * @param service - Tên dịch vụ (VD: "Máy lạnh", "Vệ sinh", ...)
 * @param page - Trang hiện tại (mặc định: 1)
 * @param limit - Số lượng kết quả (mặc định: 10)
 * @returns Response chứa danh sách thợ theo dịch vụ
 */
export const getTechniciansByService = async (
  service: string,
  page: number = 1,
  limit: number = 10
): Promise<PagedResponse<Technician>> => {
  try {
    return await getTechnicians(page, limit, { service })
  } catch (error) {
    console.error('Error fetching technicians by service:', error)
    throw error
  }
}

/**
 * Lấy danh sách thợ theo quận/huyện
 * @param district - Tên quận/huyện
 * @param page - Trang hiện tại (mặc định: 1)
 * @param limit - Số lượng kết quả (mặc định: 10)
 * @returns Response chứa danh sách thợ theo quận/huyện
 */
export const getTechniciansByDistrict = async (
  district: string,
  page: number = 1,
  limit: number = 10
): Promise<PagedResponse<Technician>> => {
  try {
    return await getTechnicians(page, limit, { district })
  } catch (error) {
    console.error('Error fetching technicians by district:', error)
    throw error
  }
}
