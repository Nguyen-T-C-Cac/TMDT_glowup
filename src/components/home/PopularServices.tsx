
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PopularServices.css';

import {
  SnowflakeIcon,
  WashingMachineIcon,
  FridgeIcon,
  WrenchIcon,
  ChevronDownIcon,
} from '../common/Icons';

import {
  getCategories,
  type Category,
} from '../../services/categoryService';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const fallbackServices: ServiceItem[] = [
  {
    id: 'CAT-001',
    name: 'Máy lạnh',
    description: 'Vệ sinh, bơm gas, sửa board mạch',
    icon: <SnowflakeIcon />,
  },
  {
    id: 'CAT-002',
    name: 'Máy giặt',
    description: 'Sửa máy giặt cửa ngang, cửa trên',
    icon: <WashingMachineIcon />,
  },
  {
    id: 'CAT-003',
    name: 'Tủ lạnh',
    description: 'Sửa tủ lạnh không lạnh, chảy nước',
    icon: <FridgeIcon />,
  },
  {
    id: 'CAT-004',
    name: 'Máy nước nóng',
    description: 'Lắp đặt, sửa chữa, bảo trì',
    icon: <WrenchIcon />,
  },
  {
    id: 'CAT-SD',
    name: 'Sửa điện',
    description: 'Sửa chữa điện dân dụng 24/7',
    icon: <WrenchIcon />,
  },
  {
    id: 'CAT-SW',
    name: 'Sửa nước',
    description: 'Sửa ống nước, thông tắc',
    icon: <WrenchIcon />,
  },
  {
    id: 'CAT-VML',
    name: 'Vệ sinh máy lạnh',
    description: 'Vệ sinh, bảo trì, nạp gas',
    icon: <SnowflakeIcon />,
  },
  {
    id: 'CAT-005',
    name: 'Khác',
    description: 'Các thiết bị gia dụng khác',
    icon: <WrenchIcon />,
  },
];

export const services: ServiceItem[] = fallbackServices;

const iconByTitle: Record<string, React.ReactNode> = {
  'Máy lạnh': <SnowflakeIcon />,
  'Máy giặt': <WashingMachineIcon />,
  'Tủ lạnh': <FridgeIcon />,
  'Máy nước nóng': <WrenchIcon />,
  'Sửa điện': <WrenchIcon />,
  'Sửa nước': <WrenchIcon />,
  'Vệ sinh máy lạnh': <SnowflakeIcon />,
  'Khác': <WrenchIcon />,
};

const mapCategoryToServiceItem = (
  category: Category,
): ServiceItem => ({
  id: category.id,
  name: category.title,
  description: category.description,
  icon: category.iconUrl ? (
    <img
      src={category.iconUrl}
      alt={category.title}
      style={{
        width: 32,
        height: 32,
        objectFit: 'contain',
      }}
    />
  ) : (
    iconByTitle[category.title] || <WrenchIcon />
  ),
});

export const PopularServices: React.FC = () => {
  const navigate = useNavigate();

  const [services, setServices] =
    useState<ServiceItem[]>(fallbackServices);

  const [loading, setLoading] = useState(true);

  const handleServiceClick = (
    service: ServiceItem,
  ) => {
    navigate(
      `/provider?service=${encodeURIComponent(
        service.name,
      )}`,
    );
  };

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const categories = await getCategories();

        const mapped =
          categories.map(mapCategoryToServiceItem);

        if (isMounted && mapped.length > 0) {
          setServices(mapped);
        }
      } catch (error) {
        console.error(
          'Failed to load popular services:',
          error,
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="home-services">
      <div className="home-services__header">
        <div>
          <div className="home-section-eyebrow">
            DỊCH VỤ PHỔ BIẾN
          </div>

          <h2 className="home-section-title">
            Tất cả những gì bạn cần
            <br />
            cho một không gian hoàn hảo
          </h2>
        </div>

        <button
          type="button"
          className="home-section-link"
          onClick={() => navigate('/services')}
        >
          Xem tất cả dịch vụ

          <ChevronDownIcon size={16} />
        </button>
      </div>

      <div className="home-services__grid">
        {loading && (
          <div className="home-empty-state">
            Đang tải dịch vụ...
          </div>
        )}

        {!loading &&
          services
            .slice(0, 8)
            .map((service, index) => (
              <button
                key={service.id}
                className="home-service-card"
                onClick={() =>
                  handleServiceClick(service)
                }
                type="button"
                style={{
                  animationDelay: `${index * 45}ms`,
                }}
              >
                <div className="home-service-card__icon">
                  {service.icon}
                </div>

                <div className="home-service-card__content">
                  <h3>{service.name}</h3>

                  <p>{service.description}</p>
                </div>

                <div className="home-service-card__arrow">
                  →
                </div>
              </button>
            ))}
      </div>
    </section>
  );
};