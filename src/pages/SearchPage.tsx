import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { searchAll, type SearchResponse } from '../services/searchService'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { WrenchIcon } from '../components/common/Icons'
import './ServicePage.css'
import './SearchPage.css'

const pageMap: Record<string, string> = {
  home: '/',
  provider: '/provider',
  services: '/services',
  rewards: '/rewards',
  'provider-profile': '/provider-profile',
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const keyword = searchParams.get('keyword') || ''

  const [result, setResult] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!keyword.trim()) {
      setResult(null)
      return
    }
    setLoading(true)
    searchAll(keyword.trim())
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false))
  }, [keyword])

  const onNavigate = (page: string, data?: unknown) => {
    const path = pageMap[page] || '/'
    navigate(path, { state: data })
  }

  const handleServiceClick = (serviceName: string) => {
    navigate(`/provider?service=${encodeURIComponent(serviceName)}`)
  }

  const hasCategories = result && result.categories.length > 0
  const hasTechnicians = result && result.technicians.items.length > 0
  const hasResults = hasCategories || hasTechnicians

  return (
    <div className="search-page">
      <Header onNavigate={onNavigate} />

      <div className="search-page__results">
        <div className="search-page__container">
          {keyword.trim() && (
            <div className="search-page__hero">
              <div className="search-page__hero-inner">
                <h1 className="search-page__hero-title">Kết quả tìm kiếm</h1>
                <p className="search-page__hero-sub">
                  &quot;{keyword}&quot;
                  {hasResults && (
                    <span>
                      {' '}— {result.categories.length} dịch vụ
                      {hasTechnicians && `, ${result.technicians.pagination.total} thợ`}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {!keyword.trim() && (
            <p className="search-page__empty">
              Gõ từ khóa vào ô tìm kiếm trên header để tìm dịch vụ hoặc thợ
            </p>
          )}

          {loading && <p className="search-page__loading">Đang tìm kiếm...</p>}

          {!loading && keyword && !hasResults && (
            <p className="search-page__empty">
              Không tìm thấy kết quả cho &quot;{keyword}&quot;
            </p>
          )}

          {!loading && hasCategories && (
            <section className="search-page__section">
              <h2>Dịch vụ</h2>
              <div className="services-page__grid">
                {result.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="services-page__card"
                    onClick={() => handleServiceClick(cat.title)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="services-page__icon">
                      {cat.iconUrl ? (
                        <img src={cat.iconUrl} alt={cat.title} />
                      ) : (
                        <WrenchIcon />
                      )}
                    </div>
                    <h3 className="services-page__name">{cat.title}</h3>
                    {cat.description && <p className="services-page__desc">{cat.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loading && hasTechnicians && (
            <section className="search-page__section">
              <h2>Thợ</h2>
              <div className="search-page__tech-box">
                <div className="search-page__tech-grid">
                  {result.technicians.items.map((tech) => (
                    <div
                      key={tech.id}
                      className="search-page__tech-card"
                      onClick={() => navigate(`/provider-profile?id=${tech.id}`)}
                    >
                      <div className="search-page__tech-avatar-wrap">
                        <img
                          src={tech.avatar || 'https://segayanime.com/wp-content/uploads/2026/01/avatar-fb-mac-dinh-1.jpg'}
                          alt={tech.fullName}
                          className="search-page__tech-avatar"
                        />
                        {tech.isAvailable && <span className="search-page__tech-badge">Sẵn sàng</span>}
                      </div>
                      <div className="search-page__tech-info">
                        <h3 className="search-page__tech-name">{tech.fullName}</h3>
                        {tech.skills && (
                          <p className="search-page__tech-skills">{tech.skills.slice(0, 3).join(' • ')}</p>
                        )}
                        <div className="search-page__tech-meta">
                          {tech.rating != null && (
                            <span className="search-page__tech-rating">
                              {'★'} {Number(tech.rating).toFixed(1)}
                            </span>
                          )}
                          {tech.location && (
                            <span className="search-page__tech-location">{tech.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {result.technicians.pagination.totalPages > 1 && (
                  <p
                    className="search-page__more"
                    onClick={() => navigate(`/provider?keyword=${encodeURIComponent(keyword)}`)}
                  >
                    Xem tất cả thợ ({result.technicians.pagination.total})
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
