import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Provider.css';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FilterSidebar, type ProviderFilters } from '../components/provider/FilterSidebar';
import { ProviderList } from '../components/provider/ProviderList';
import { buildProviderProfilePath } from '../utils/providerNavigation';

const pageMap: Record<string, string> = {
  'home': '/',
  'provider': '/provider',
  'services': '/services',
  'rewards': '/rewards',
  'provider-profile': '/provider-profile',
  'provider-dashboard': '/provider-dashboard',
  'customer-settings': '/customer/account-settings',
  'login': '/auth/login',
};

export const Provider: React.FC = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service') || undefined;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ProviderFilters>({});

  const onNavigate = (page: string, data?: unknown) => {
    const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const technicianId =
      typeof record?.id === 'string'
        ? record.id
        : typeof record?.technicianId === 'string'
          ? record.technicianId
          : null;

    if (page === 'provider-profile' && technicianId) {
      nav(buildProviderProfilePath(technicianId), { state: { ...record, id: technicianId } });
      return;
    }

    const path = pageMap[page] || '/';
    nav(path, { state: data });
  };

  return (
    <div className="provider-page-wrapper" style={{ flex: 1, minWidth: 0 }}>
      <Header onNavigate={onNavigate} />

      <main className="fp-main-container">
        {/* Hàng trên cùng: Hero Card full width */}
        <div className="fp-hero-card">
          <h2 className="fp-hero-title">Kết nối thợ chuyên nghiệp hàng đầu</h2>
          <p className="fp-hero-subtitle">
            Tìm kiếm, so sánh và đặt lịch hẹn dễ dàng với các chuyên gia có tay nghề cao trong khu vực của bạn.
          </p>
        </div>

        {/* Hàng dưới: Danh sách thợ (trái) + Lọc theo khu vực (phải) */}
        <div className="fp-layout">
          <ProviderList
            onNavigate={onNavigate}
            selectedService={selectedService}
            filters={filters}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setTotalPages={setTotalPages}
          />
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Provider;
