import React from 'react';
import './FilterSidebar.css';

interface FilterSidebarProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  return (
    <aside className="filter-sidebar">
      <div className="filter-section">
        <h3 className="filter-title">Lọc theo khu vực</h3>
        <p className="filter-subtitle">TP.HCM</p>
        
        <div className="filter-options">
          <label className="filter-checkbox">
            <input type="checkbox" defaultChecked />
            <span className="checkmark">
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span className="filter-text">Quận 1, HCMC</span>
          </label>
          <label className="filter-checkbox">
            <input type="checkbox" />
            <span className="checkmark">
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span className="filter-text">Quận 7, HCMC</span>
          </label>
          <label className="filter-checkbox">
            <input type="checkbox" />
            <span className="checkmark">
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span className="filter-text">Thủ Đức, HCMC</span>
          </label>
          <label className="filter-checkbox">
            <input type="checkbox" />
            <span className="checkmark">
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span className="filter-text">Quận Bình Thạnh, HCMC</span>
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
