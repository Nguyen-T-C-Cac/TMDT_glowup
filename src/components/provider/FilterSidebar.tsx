import React from 'react';
import './FilterSidebar.css';
import { StarIcon } from '../common/Icons';

export interface ProviderFilters {
  district?: string;
  minRating?: number;
  isAvailable?: boolean;
}

const DISTRICT_OPTIONS = [
  'Quận 1, HCMC',
  'Quận 7, HCMC',
  'Thủ Đức, HCMC',
  'Quận Bình Thạnh, HCMC',
];

const RATING_OPTIONS = [
  { value: 4.5, label: '4.5+', filled: 5 },
  { value: 4.0, label: '4.0+', filled: 4 },
];

interface FilterSidebarProps {
  filters?: ProviderFilters;
  onFiltersChange?: (filters: ProviderFilters) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters = {},
  onFiltersChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const update = (patch: Partial<ProviderFilters>) => {
    onFiltersChange?.({ ...filters, ...patch });
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-section">
        <h3 className="filter-title">Lọc theo khu vực</h3>
        <p className="filter-subtitle">TP.HCM</p>
        
        <div className="filter-options">
          <label className="filter-checkbox">
            <input
              type="radio"
              name="district"
              checked={!filters.district}
              onChange={() => update({ district: undefined })}
            />
            <span className="checkmark border-circle"></span>
            <span className="filter-text">Tất cả khu vực</span>
          </label>
          {DISTRICT_OPTIONS.map((district) => (
            <label className="filter-checkbox" key={district}>
              <input
                type="radio"
                name="district"
                checked={filters.district === district}
                onChange={() => update({ district })}
              />
              <span className="checkmark border-circle"></span>
              <span className="filter-text">{district}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Đánh giá</h3>
        <div className="filter-options">
          <label className="filter-checkbox">
            <input
              type="radio"
              name="rating"
              checked={!filters.minRating}
              onChange={() => update({ minRating: undefined })}
            />
            <span className="checkmark border-circle"></span>
            <span className="filter-text">Tất cả</span>
          </label>
          {RATING_OPTIONS.map((option) => (
            <label className="filter-checkbox" key={option.value}>
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === option.value}
                onChange={() => update({ minRating: option.value })}
              />
              <span className="checkmark border-circle"></span>
              <div className="filter-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    size={14}
                    className={`star-icon ${i < option.filled ? 'text-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
                <span className="rating-text">{option.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Trạng thái</h3>
        <div className="filter-options">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!filters.isAvailable}
              onChange={(e) => update({ isAvailable: e.target.checked ? true : undefined })}
            />
            <span className="checkmark"></span>
            <span className="filter-text">Đang nhận việc</span>
          </label>
        </div>
      </div>

      {/* Phân trang nằm dưới lọc khu vực */}
      {totalPages > 1 && onPageChange && (
        <div className="sidebar-pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            &laquo;
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            &raquo;
          </button>
        </div>
      )}
    </aside>
  );
};
