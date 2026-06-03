
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PopularServices.css';

import {
  SnowflakeIcon,
  WashingMachineIcon,
  FridgeIcon,
  BroomIcon,
  WrenchIcon,
  BugIcon,
  MicrowaveIcon,
  CarIcon,
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
    id: '1',
    name: 'Máy lạnh',
    description: 'Vệ sinh & Bảo trì',
    icon: <SnowflakeIcon />,
  },
  {
    id: '2',
    name: 'Giặt ủi',
    description: 'Sạch tận cơ sở',
    icon: <WashingMachineIcon />,
  },
  {
    id: '3',
    name: 'Tủ lạnh',
    description: 'Bảo trì định kỳ',
    icon: <FridgeIcon />,
  },
  {
    id: '4',
    name: 'Dọn dẹp',
    description: 'Theo giờ / Định kỳ',
    icon: <BroomIcon />,
  },
  {
    id: '5',
    name: 'Điện nước',
    description: 'Sửa chữa 24/7',
    icon: <WrenchIcon />,
  },
  {
    id: '6',
    name: 'Côn trùng',
    description: 'Phun / Diệt triệt để',
    icon: <BugIcon />,
  },
  {
    id: '7',
    name: 'Lò vi sóng',
    description: 'Sửa chữa & Bảo trì',
    icon: <MicrowaveIcon />,
  },
  {
    id: '8',
    name: 'Xe hơi',
    description: 'Rửa & Chăm sóc',
    icon: <CarIcon />,
  },
];

export const services: ServiceItem[] = fallbackServices;

const iconByTitle: Record<string, React.ReactNode> = {
  'Máy lạnh': <SnowflakeIcon />,
  'Giặt ủi': <WashingMachineIcon />,
  'Tủ lạnh': <FridgeIcon />,
  'Dọn dẹp': <BroomIcon />,
  'Điện nước': <WrenchIcon />,
  'Côn trùng': <BugIcon />,
  'Lò vi sóng': <MicrowaveIcon />,
  'Xe hơi': <CarIcon />,
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