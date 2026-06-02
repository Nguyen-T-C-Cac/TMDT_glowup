import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import {
  SnowflakeIcon,
  WashingMachineIcon,
  FridgeIcon,
  BroomIcon,
  WrenchIcon,
  BugIcon,
  MicrowaveIcon,
  CarIcon,
} from '../components/common/Icons';
import { getCategories, type Category } from '../services/categoryService';
import './ServicePage.css'; // Reusing the CSS

const pageMap: Record<string, string> = {
  'home': '/',
  'provider': '/provider',
  'services': '/services',
  'rewards': '/rewards',
  'provider-profile': '/provider-profile',
  'provider-dashboard': '/technician/dashboard',
  'customer-settings': '/customer/account-settings',
  'login': '/auth/login',
};

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iconByTitle = useMemo(() => ({
    'Máy lạnh': <SnowflakeIcon />,
    'Giặt ủi': <WashingMachineIcon />,
    'Tủ lạnh': <FridgeIcon />,
    'Dọn dẹp': <BroomIcon />,
    'Điện nước': <WrenchIcon />,
    'Côn trùng': <BugIcon />,
    'Lò vi sóng': <MicrowaveIcon />,
    'Xe hơi': <CarIcon />,
  }), []);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const items = await getCategories();
        const activeItems = items.filter((item) => {
          const status = (item.status || '').toUpperCase();
          return !status || status === 'ACTIVE';
        });

        if (isMounted) {
          setCategories(activeItems);
        }
      } catch (loadError) {
        console.error('Failed to load categories:', loadError);
        if (isMounted) {
          setError('Không thể tải danh sách dịch vụ');
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleServiceClick = (serviceName: string) => {
    navigate(`/provider?service=${encodeURIComponent(serviceName)}`);
  };

  const onNavigate = (page: string, data?: any) => {
    const path = pageMap[page] || '/';
    navigate(path, { state: data });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onNavigate={onNavigate} />

      <main style={{ flexGrow: 1, padding: '40px 0' }}>
        <section className="services-page" style={{ margin: '0 auto' }}>
          <div className="services-page__header">
            <div>
              <h1 className="services-page__title">Tất cả dịch vụ</h1>
              <p className="services-page__subtitle">Khám phá các dịch vụ chăm sóc nhà cửa toàn diện từ GlowUp.</p>
            </div>
          </div>

          <div className="services-page__grid">
            {loading && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 16px' }}>
                Đang tải danh sách dịch vụ...
              </div>
            )}

            {error && !loading && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 16px', color: '#e74c3c' }}>
                {error}
              </div>
            )}

            {!loading && !error && categories.map((category) => (
              <div
                key={category.id}
                className="services-page__card"
                onClick={() => handleServiceClick(category.title)}
                role="button"
                tabIndex={0}
              >
                <div className="services-page__icon">
                  {category.iconUrl ? (
                    <img src={category.iconUrl} alt={category.title} />
                  ) : (
                    iconByTitle[category.title as keyof typeof iconByTitle] || <WrenchIcon />
                  )}
                </div>
                <h3 className="services-page__name">{category.title}</h3>
                <p className="services-page__desc">{category.description}</p>
              </div>
            ))}

            {!loading && !error && categories.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 16px' }}>
                Không có dịch vụ nào để hiển thị.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;
