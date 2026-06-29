import React from 'react';
import './FilterSidebar.css';

interface FilterSidebarProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
}
const HCMC_LOCATIONS = [
  "Quận 1",
  "Quận 3",
  "Quận 4",
  "Quận 5",
  "Quận 6",
  "Quận 7",
  "Quận 8",
  "Quận 10",
  "Quận 11",
  "Quận 12",
  "Quận Bình Thạnh",
  "Quận Gò Vấp",
  "Quận Phú Nhuận",
  "Quận Tân Bình",
  "Quận Tân Phú",
  "Thành phố Thủ Đức",
  "Huyện Bình Chánh",
  "Huyện Củ Chi",
  "Huyện Hóc Môn",
  "Huyện Nhà Bè",
  "Huyện Cần Giờ",
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  selectedLocations,
  onLocationChange,
}) => {

    const handleChange = (location: string) => {
        if (selectedLocations.includes(location)) {
            onLocationChange(
                selectedLocations.filter(item => item !== location)
            );
        } else {
            onLocationChange([
                ...selectedLocations,
                location
            ]);
        }
    };
  return (
    <aside className="filter-sidebar">
      <div className="filter-section">
        <h3 className="filter-title">Lọc theo khu vực</h3>
        <p className="filter-subtitle">TP.HCM</p>
        
        <div className="filter-options">
  {HCMC_LOCATIONS.map((location) => (
    <label key={location} className="filter-checkbox">
      <input
        type="checkbox"
        checked={selectedLocations.includes(location)}
        onChange={() => handleChange(location)}
      />

      <span className="checkmark">
        <svg
          className="check-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>

      <span className="filter-text">{location}</span>
    </label>
  ))}
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
