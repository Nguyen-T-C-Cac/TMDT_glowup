import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { searchAll, type SearchResponse } from '../services/searchService'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import './SearchPage.css'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const keyword = searchParams.get('keyword') || ''

  const [result, setResult] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState(keyword)

  useEffect(() => {
    if (!keyword.trim()) return
    setLoading(true)
    searchAll(keyword.trim())
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false))
  }, [keyword])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    navigate(`/search?keyword=${encodeURIComponent(inputValue.trim())}`)
  }

  const hasCategories = result && result.categories.length > 0
  const hasTechnicians = result && result.technicians.items.length > 0
  const hasResults = hasCategories || hasTechnicians

  return (
    <div className="search-page">
      <Header onNavigate={(page) => {
        if (page === 'home') navigate('/')
        else if (page === 'services') navigate('/services')
        else if (page === 'provider') navigate('/provider')
        else if (page === 'rewards') navigate('/rewards')
      }} />

      <div className="search-page__hero">
        <div className="search-page__container">
          <h1>Tìm kiếm</h1>
          <form className="search-page__bar" onSubmit={handleSearch}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tìm dịch vụ hoặc thợ..."
              className="search-page__input"
            />
            <button type="submit" className="search-page__btn">Tìm</button>
          </form>
        </div>
      </div>

      <div className="search-page__results">
        <div className="search-page__container">
          {loading && <p className="search-page__loading">Đang tìm kiếm...</p>}

          {!loading && keyword && !hasResults && (
            <p className="search-page__empty">Không tìm thấy kết quả cho &quot;{keyword}&quot;</p>
          )}

          {!loading && !keyword && (
            <p className="search-page__empty">Nhập từ khóa để tìm kiếm dịch vụ hoặc thợ</p>
          )}

          {!loading && hasCategories && (
            <section className="search-page__section">
              <h2>Dịch vụ</h2>
              <div className="search-page__grid">
                {result.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="search-page__card search-page__card--category"
                    onClick={() => navigate(`/services?category=${cat.id}`)}
                  >
                    {cat.iconUrl && (
                      <img src={cat.iconUrl} alt={cat.title} className="search-page__icon" />
                    )}
                    <div>
                      <h3>{cat.title}</h3>
                      {cat.description && <p>{cat.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loading && hasTechnicians && (
            <section className="search-page__section">
              <h2>Thợ</h2>
              <div className="search-page__grid">
                {result.technicians.items.map((tech) => (
                  <div
                    key={tech.id}
                    className="search-page__card search-page__card--technician"
                    onClick={() => navigate(`/provider-profile?id=${tech.id}`)}
                  >
                    <img
                      src={tech.avatar || 'https://segayanime.com/wp-content/uploads/2026/01/avatar-fb-mac-dinh-1.jpg'}
                      alt={tech.fullName}
                      className="search-page__avatar"
                    />
                    <div>
                      <h3>{tech.fullName}</h3>
                      {tech.skills && <p>{tech.skills.join(', ')}</p>}
                      {tech.location && <p className="search-page__meta">{tech.location}</p>}
                      {tech.rating != null && (
                        <p className="search-page__meta">&#9733; {Number(tech.rating).toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {result.technicians.pagination.totalPages > 1 && (
                <p className="search-page__more" onClick={() => navigate(`/provider?keyword=${encodeURIComponent(keyword)}`)}>
                  Xem tất cả thợ ({result.technicians.pagination.total})
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
