-- =====================================================================
-- GlowUp Concierge — demo seed data
-- =====================================================================
--
-- Tất cả user dùng password DEMO: "12345"
-- BCrypt hash = $2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2
--
-- Login mẫu:
--   admin@gmail.com   / 12345   (role: admin)
--   hai@gmail.com     / 12345   (role: customer)
--   linh@gmail.com    / password   (role: customer)
--   bao@gmail.com     / password   (role: customer)
--   my@gmail.com      / password   (role: customer)
--   huy@gmail.com     / password   (role: technician)
--   dat@gmail.com     / password   (role: technician)
--   phuc@gmail.com    / password   (role: technician — ví LOCKED demo)
--   nam@gmail.com     / password   (role: technician)
--   khoa@gmail.com    / password   (role: technician)
--   hoanganh@gmail.com / password  (role: technician)
--   tung@gmail.com    / password   (role: technician)
--   hong@gmail.com    / password   (role: technician)
--   tuan@gmail.com    / password   (role: technician)
--   hai.tech@gmail.com / password  (role: technician)
--   long@gmail.com    / password   (role: technician)
--   cuong@gmail.com   / password   (role: technician)
--   mai@gmail.com     / password   (role: technician)
--   phuong@gmail.com  / password   (role: technician)
--   quan@gmail.com    / password   (role: technician)
--   thanh@gmail.com   / password   (role: technician)
--   phat@gmail.com    / password   (role: technician)
--   duc@gmail.com     / password   (role: technician)
--   tai@gmail.com     / password   (role: technician)
--   loc@gmail.com     / password   (role: technician)
--   hieu@gmail.com    / password   (role: technician)
--   son@gmail.com     / password   (role: technician)
--   binh@gmail.com    / password   (role: technician)
--   hoang.tech@gmail.com / password (role: technician)
--   tin@gmail.com     / password   (role: technician)
-- =====================================================================

-- 1. USERS

INSERT INTO users (code, full_name, email, phone, password, role, status, district, address, bio, avatar, deleted, created_at, updated_at)
VALUES
('USR-001', 'Admin Demo', 'admin@gmail.com', '0909000001',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'ADMIN', 'ACTIVE', 'Quận 1', '18 Pasteur, Quận 1', NULL,
 'https://i.pravatar.cc/150?img=64', FALSE, NOW(), NOW()),

('USR-002', 'Nguyễn Văn Hai', 'hai@gmail.com', '0909234502',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'CUSTOMER', 'ACTIVE', 'Thành phố Thủ Đức', '55 Đường số 12, Khu đô thị An Phú', NULL,
 'https://i.pravatar.cc/150?img=9', FALSE, NOW(), NOW()),

('USR-003', 'Trần Ngọc Linh', 'linh@gmail.com', '0909234503',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'CUSTOMER', 'ACTIVE', 'Quận 10', '102 Thành Thái, Quận 10', NULL,
 'https://i.pravatar.cc/150?img=16', FALSE, NOW(), NOW()),

('USR-004', 'Lê Minh Huy', 'huy@gmail.com', '0988123404',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận Phú Nhuận', '39 Hoa Lan, Phú Nhuận',
 'Chuyên xử lý máy lạnh dân dụng, vệ sinh định kỳ và tối ưu hiệu suất hệ thống làm mát.',
 'https://i.pravatar.cc/150?img=31', FALSE, NOW(), NOW()),

('USR-005', 'Phạm Quốc Đạt', 'dat@gmail.com', '0988123405',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận Gò Vấp', '144 Phạm Văn Chiêu, Gò Vấp',
 'Có kinh nghiệm sửa máy giặt inverter, máy sấy và thiết bị điện gia dụng cỡ lớn.',
 'https://i.pravatar.cc/150?img=18', FALSE, NOW(), NOW()),

-- Thợ demo trạng thái ví LOCKED (ví tín dụng về 0) — phục vụ test wallet/refund/points
('USR-006', 'Ngô Thành Phúc', 'phuc@gmail.com', '0988123406',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận Tân Phú', '87 Lũy Bán Bích, Tân Phú',
 'Tài khoản kỹ thuật viên seed dùng để kiểm thử trạng thái khóa ví và hoàn tiền.',
 'https://i.pravatar.cc/150?img=47', FALSE, NOW(), NOW()),

('USR-007', 'Đỗ Gia Bảo', 'bao@gmail.com', '0909234507',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'CUSTOMER', 'ACTIVE', 'Quận 7', '12 Nguyễn Thị Thập, Quận 7', NULL,
 'https://i.pravatar.cc/150?img=22', FALSE, NOW(), NOW()),

('USR-008', 'Võ Khánh My', 'my@gmail.com', '0909234508',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'CUSTOMER', 'ACTIVE', 'Quận Bình Thạnh', '88 Xô Viết Nghệ Tĩnh, Bình Thạnh', NULL,
 'https://i.pravatar.cc/150?img=27', FALSE, NOW(), NOW()),

('USR-009', 'Bùi Thanh Nam', 'nam@gmail.com', '0988123409',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 3', '61 Điện Biên Phủ, Quận 3',
 'Chuyên xử lý tủ lạnh side by side, tủ mát và các lỗi xì gas nhẹ.',
 'https://i.pravatar.cc/150?img=35', FALSE, NOW(), NOW()),

('USR-010', 'Huỳnh Anh Khoa', 'khoa@gmail.com', '0988123410',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 12', '24 Tô Ký, Quận 12',
 'Làm máy nước nóng, điện dân dụng và bảo trì thiết bị gia đình theo lịch định kỳ.',
 'https://i.pravatar.cc/150?img=41', FALSE, NOW(), NOW())

ON CONFLICT (code) DO NOTHING;

-- 20 thợ bổ sung (USR-011 ~ USR-030)
INSERT INTO users (code, full_name, email, phone, password, role, status, district, address, bio, avatar, deleted, created_at, updated_at)
VALUES
('USR-011', 'Nguyễn Hoàng Anh', 'hoanganh@gmail.com', '0988123411',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 1', '12 Nguyễn Huệ, Quận 1',
 'Chuyên vệ sinh máy lạnh cao cấp, xử lý lỗi board mạch inverter.',
 'https://i.pravatar.cc/150?img=60', FALSE, NOW(), NOW()),
('USR-012', 'Trần Văn Tùng', 'tung@gmail.com', '0988123412',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 2', '25 Lương Định Của, Quận 2',
 'Sửa máy giặt các loại, thay board và bảo trì định kỳ.',
 'https://i.pravatar.cc/150?img=33', FALSE, NOW(), NOW()),
('USR-013', 'Lê Thị Hồng', 'hong@gmail.com', '0988123413',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 3', '88 Võ Văn Tần, Quận 3',
 'Làm máy lạnh dân dụng và văn phòng, vệ sinh nhanh sạch.',
 'https://i.pravatar.cc/150?img=37', FALSE, NOW(), NOW()),
('USR-014', 'Phạm Minh Tuấn', 'tuan@gmail.com', '0988123414',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 4', '42 Tôn Đản, Quận 4',
 'Chuyên tủ lạnh side by side, tủ mát thương mại, xì gas.',
 'https://i.pravatar.cc/150?img=40', FALSE, NOW(), NOW()),
('USR-015', 'Vũ Đức Hải', 'hai.tech@gmail.com', '0988123415',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 5', '71 Trần Hưng Đạo, Quận 5',
 'Lắp và sửa máy nước nóng năng lượng mặt trời, bình điện.',
 'https://i.pravatar.cc/150?img=44', FALSE, NOW(), NOW()),
('USR-016', 'Hoàng Văn Long', 'long@gmail.com', '0988123416',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 6', '19 Hậu Giang, Quận 6',
 'Vệ sinh và bảo trì máy lạnh trung tâm, máy lạnh âm trần.',
 'https://i.pravatar.cc/150?img=45', FALSE, NOW(), NOW()),
('USR-017', 'Đặng Quốc Cường', 'cuong@gmail.com', '0988123417',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 7', '56 Nguyễn Lương Bằng, Quận 7',
 'Sửa máy giặt cửa ngang, máy sấy quần áo gia đình.',
 'https://i.pravatar.cc/150?img=48', FALSE, NOW(), NOW()),
('USR-018', 'Bùi Thị Mai', 'mai@gmail.com', '0988123418',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 8', '33 Phạm Thế Hiển, Quận 8',
 'Chuyên máy lạnh dân dụng, vệ sinh nhanh, giá rẻ, có bảo hành.',
 'https://i.pravatar.cc/150?img=50', FALSE, NOW(), NOW()),
('USR-019', 'Đỗ Văn Phương', 'phuong@gmail.com', '0988123419',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 9', '97 Lê Văn Việt, Quận 9',
 'Sửa tủ lạnh, tủ đông, kho lạnh thương mại và dân dụng.',
 'https://i.pravatar.cc/150?img=51', FALSE, NOW(), NOW()),
('USR-020', 'Ngô Minh Quân', 'quan@gmail.com', '0988123420',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 10', '64 Lý Thường Kiệt, Quận 10',
 'Lắp máy nước nóng, sửa điện dân dụng, thay aptomat chống giật.',
 'https://i.pravatar.cc/150?img=52', FALSE, NOW(), NOW()),
('USR-021', 'Dương Văn Thành', 'thanh@gmail.com', '0988123421',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 11', '15 Lãnh Binh Thăng, Quận 11',
 'Bảo trì máy lạnh tổng quát, sửa chữa rò nước, bơm gas.',
 'https://i.pravatar.cc/150?img=53', FALSE, NOW(), NOW()),
('USR-022', 'Lâm Văn Phát', 'phat@gmail.com', '0988123422',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Quận 12', '28 Trường Chinh, Quận 12',
 'Sửa máy giặt inverter, cân bằng lồng giặt, thay vòng bi.',
 'https://i.pravatar.cc/150?img=54', FALSE, NOW(), NOW()),
('USR-023', 'Trương Văn Đức', 'duc@gmail.com', '0988123423',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Bình Thạnh', '44 Phan Văn Trị, Bình Thạnh',
 'Chuyên tủ lạnh, tủ mát, bảo dưỡng định kỳ cho hộ gia đình.',
 'https://i.pravatar.cc/150?img=55', FALSE, NOW(), NOW()),
('USR-024', 'Huỳnh Văn Tài', 'tai@gmail.com', '0988123424',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Gò Vấp', '77 Quang Trung, Gò Vấp',
 'Vệ sinh máy lạnh, xử lý lỗi block, thay tụ và quạt dàn nóng.',
 'https://i.pravatar.cc/150?img=56', FALSE, NOW(), NOW()),
('USR-025', 'Phan Văn Lộc', 'loc@gmail.com', '0988123425',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Tân Bình', '30 Bạch Đằng, Tân Bình',
 'Lắp đặt và sửa chữa máy nước nóng, thiết bị vệ sinh thông minh.',
 'https://i.pravatar.cc/150?img=57', FALSE, NOW(), NOW()),
('USR-026', 'Tô Văn Hiếu', 'hieu@gmail.com', '0988123426',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Tân Phú', '52 Lũy Bán Bích, Tân Phú',
 'Sửa máy giặt các hãng, thay dây curoa, bơm xả, bo mạch.',
 'https://i.pravatar.cc/150?img=58', FALSE, NOW(), NOW()),
('USR-027', 'Dương Ngọc Sơn', 'son@gmail.com', '0988123427',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Phú Nhuận', '90 Phan Đình Phùng, Phú Nhuận',
 'Máy lạnh multi, máy lạnh âm trần cho căn hộ chung cư.',
 'https://i.pravatar.cc/150?img=59', FALSE, NOW(), NOW()),
('USR-028', 'Thái Văn Bình', 'binh@gmail.com', '0988123428',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Thành phố Thủ Đức', '23 Xa lộ Hà Nội, Thủ Đức',
 'Chuyên tủ lạnh inverter, xử lý lỗi board và block kém lạnh.',
 'https://i.pravatar.cc/150?img=61', FALSE, NOW(), NOW()),
('USR-029', 'Lý Văn Hoàng', 'hoang.tech@gmail.com', '0988123429',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Bình Tân', '82 Hương lộ 2, Bình Tân',
 'Lắp máy nước nóng trực tiếp và gián tiếp, sửa điện gia dụng.',
 'https://i.pravatar.cc/150?img=62', FALSE, NOW(), NOW()),
('USR-030', 'Mai Văn Tín', 'tin@gmail.com', '0988123430',
 '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2',
 'TECHNICIAN', 'ACTIVE', 'Nhà Bè', '18 Nguyễn Văn Tạo, Nhà Bè',
 'Vệ sinh máy lạnh, sửa chữa và bảo trì thiết bị điện tử gia dụng.',
 'https://i.pravatar.cc/150?img=63', FALSE, NOW(), NOW())

ON CONFLICT (code) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (code, title, description, icon_url, priority, status, deleted, created_at, updated_at)
VALUES
('CAT-001', 'Máy lạnh',     'Vệ sinh, bơm gas, sửa chữa board mạch máy lạnh inverter.',
  NULL, 'HIGH',   'ACTIVE', FALSE, NOW(), NOW()),
('CAT-002', 'Máy giặt',     'Sửa chữa máy giặt cửa ngang, cửa trên, vắt không sạch, không xả nước.',
  NULL, 'HIGH',   'ACTIVE', FALSE, NOW(), NOW()),
('CAT-003', 'Tủ lạnh',      'Sửa tủ lạnh không lạnh, chảy nước, kêu to, board điện tử.',
  NULL, 'NORMAL', 'ACTIVE', FALSE, NOW(), NOW()),
('CAT-004', 'Máy nước nóng','Lắp đặt, sửa chữa, bảo trì máy nước nóng năng lượng mặt trời + điện.',
  NULL, 'NORMAL', 'ACTIVE', FALSE, NOW(), NOW()),
('CAT-005', 'Khác',         'Các thiết bị gia dụng khác: lò vi sóng, máy lọc nước, quạt công nghiệp.',
  NULL, 'LOW',    'ACTIVE', FALSE, NOW(), NOW())

ON CONFLICT (code) DO NOTHING;

-- 3. TECHNICIAN PROFILES
INSERT INTO technician_profiles (user_id, cover_image, service_category, price_per_hour, is_available,
                                  type, title_badge, years_experience, verification_status,
                                  last_active_at, joined_at, updated_at)
SELECT
  u.id,
  v.cover_image,
  v.service_category,
  v.price_per_hour,
  TRUE,
  v.type,
  v.title_badge,
  v.years_experience,
  v.verification_status,
  NOW(),
  v.joined_at,
  NOW()
FROM users u CROSS JOIN LATERAL (VALUES
  ('USR-004', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 'Máy lạnh', 280000, 'PREMIUM', 'CHUYEN GIA UU TIEN', 8, 'APPROVED', NOW() - INTERVAL '2 years'),
  ('USR-005', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', 'Máy giặt', 190000, 'NORMAL', NULL, 6, 'APPROVED', NOW() - INTERVAL '1 year'),
  ('USR-006', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', 'Máy lạnh', 150000, 'NORMAL', NULL, 2, 'APPROVED', NOW() - INTERVAL '6 months'),
  ('USR-009', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952', 'Tủ lạnh', 220000, 'NORMAL', 'THO LANH KINH NGHIEM', 7, 'APPROVED', NOW() - INTERVAL '18 months'),
  ('USR-010', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', 'Máy nước nóng', 210000, 'NORMAL', NULL, 4, 'APPROVED', NOW() - INTERVAL '10 months'),
  ('USR-011', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 'Máy lạnh', 300000, 'PREMIUM', 'CHUYEN GIA MAY LANH', 10, 'APPROVED', NOW() - INTERVAL '3 years'),
  ('USR-012', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', 'Máy giặt', 180000, 'NORMAL', NULL, 5, 'APPROVED', NOW() - INTERVAL '2 years'),
  ('USR-013', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 'Máy lạnh', 200000, 'NORMAL', NULL, 5, 'APPROVED', NOW() - INTERVAL '1 year'),
  ('USR-014', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952', 'Tủ lạnh', 250000, 'PREMIUM', 'CHUYEN TU LANH', 9, 'APPROVED', NOW() - INTERVAL '3 years'),
  ('USR-015', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', 'Máy nước nóng', 200000, 'NORMAL', NULL, 6, 'APPROVED', NOW() - INTERVAL '2 years'),
  ('USR-016', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 'Máy lạnh', 320000, 'PREMIUM', 'CHUYEN GIA MAY LANH', 11, 'APPROVED', NOW() - INTERVAL '4 years'),
  ('USR-017', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', 'Máy giặt', 170000, 'NORMAL', NULL, 4, 'APPROVED', NOW() - INTERVAL '1 year'),
  ('USR-018', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 'Máy lạnh', 180000, 'NORMAL', NULL, 3, 'APPROVED', NOW() - INTERVAL '8 months'),
  ('USR-019', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952', 'Tủ lạnh', 230000, 'NORMAL', NULL, 7, 'APPROVED', NOW() - INTERVAL '2 years'),
  ('USR-020', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', 'Máy nước nóng', 190000, 'NORMAL', NULL, 4, 'APPROVED', NOW() - INTERVAL '1 year'),
  ('USR-021', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 'Máy lạnh', 210000, 'NORMAL', NULL, 6, 'APPROVED', NOW() - INTERVAL '2 years'),
  ('USR-022', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', 'Máy giặt', 260000, 'PREMIUM', 'CHUYEN MAY GIAT', 8, 'APPROVED', NOW() - INTERVAL '3 years'),
  ('USR-023', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952', 'Tủ lạnh', 200000, 'NORMAL', NULL, 5, 'APPROVED', NOW() - INTERVAL '18 months'),
  ('USR-024', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 'Máy lạnh', 190000, 'NORMAL', NULL, 4, 'APPROVED', NOW() - INTERVAL '1 year'),
  ('USR-025', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', 'Máy nước nóng', 210000, 'NORMAL', NULL, 5, 'APPROVED', NOW() - INTERVAL '2 years'),
  ('USR-026', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', 'Máy giặt', 175000, 'NORMAL', NULL, 4, 'APPROVED', NOW() - INTERVAL '1 year'),
  ('USR-027', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 'Máy lạnh', 290000, 'PREMIUM', 'CHUYEN GIA MAY LANH', 9, 'APPROVED', NOW() - INTERVAL '3 years'),
  ('USR-028', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952', 'Tủ lạnh', 215000, 'NORMAL', NULL, 6, 'APPROVED', NOW() - INTERVAL '2 years'),
  ('USR-029', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd', 'Máy nước nóng', 185000, 'NORMAL', NULL, 3, 'APPROVED', NOW() - INTERVAL '8 months'),
  ('USR-030', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 'Máy lạnh', 195000, 'NORMAL', NULL, 4, 'APPROVED', NOW() - INTERVAL '1 year')
) AS v(code, cover_image, service_category, price_per_hour, type, title_badge, years_experience, verification_status, joined_at)
WHERE u.code = v.code
ON CONFLICT (user_id) DO NOTHING;


-- 4. TECHNICIAN SKILLS
INSERT INTO technician_skills (profile_id, skill)
SELECT tp.id, v.skill
FROM technician_profiles tp
JOIN users u ON tp.user_id = u.id
CROSS JOIN LATERAL (VALUES
  ('USR-004', 'Vệ sinh máy lạnh inverter'), ('USR-004', 'Xử lý rò nước dàn lạnh'), ('USR-004', 'Bảo trì hệ thống làm mát'),
  ('USR-005', 'Sửa máy giặt inverter'), ('USR-005', 'Cân chỉnh lồng giặt'), ('USR-005', 'Thay bo mạch thiết bị gia dụng'),
  ('USR-006', 'Vệ sinh máy lạnh cơ bản'), ('USR-006', 'Sửa máy lạnh đơn giản'), ('USR-006', 'Bảo trì máy lạnh'),
  ('USR-009', 'Sửa tủ lạnh inverter'), ('USR-009', 'Xử lý đóng tuyết ngăn đá'), ('USR-009', 'Kiểm tra rò rỉ gas'),
  ('USR-010', 'Lắp máy nước nóng'), ('USR-010', 'Thay thanh đốt'), ('USR-010', 'Kiểm tra chống giật ELCB'),
  ('USR-011', 'Vệ sinh máy lạnh cao cấp'), ('USR-011', 'Sửa board mạch inverter'), ('USR-011', 'Bơm gas máy lạnh'),
  ('USR-012', 'Sửa máy giặt cửa ngang'), ('USR-012', 'Thay vòng bi máy giặt'), ('USR-012', 'Sửa lỗi E mam. giặt'),
  ('USR-013', 'Vệ sinh máy lạnh gia đình'), ('USR-013', 'Sửa máy lạnh văn phòng'), ('USR-013', 'Xử lý rò nước'),
  ('USR-014', 'Sửa tủ lạnh side by side'), ('USR-014', 'Xì gas tủ lạnh'), ('USR-014', 'Thay block tủ lạnh'),
  ('USR-015', 'Lắp máy nước nóng NLMT'), ('USR-015', 'Sửa bình nóng lạnh'), ('USR-015', 'Thay rơ le nhiệt'),
  ('USR-016', 'Vệ sinh máy lạnh âm trần'), ('USR-016', 'Sửa máy lạnh trung tâm'), ('USR-016', 'Bảo trì VRV/VRF'),
  ('USR-017', 'Sửa máy giặt Electrolux'), ('USR-017', 'Sửa máy sấy quần áo'), ('USR-017', 'Thay bơm xả'),
  ('USR-018', 'Vệ sinh máy lạnh nhanh'), ('USR-018', 'Sửa máy lạnh dân dụng'), ('USR-018', 'Kiểm tra gas'),
  ('USR-019', 'Sửa tủ lạnh tủ đông'), ('USR-019', 'Sửa kho lạnh thương mại'), ('USR-019', 'Thay dàn nóng lạnh'),
  ('USR-020', 'Sửa máy nước nóng điện'), ('USR-020', 'Lắp aptomat chống giật'), ('USR-020', 'Đấu nối điện dân dụng'),
  ('USR-021', 'Bơm gas máy lạnh'), ('USR-021', 'Sửa rò nước dàn lạnh'), ('USR-021', 'Vệ sinh dàn nóng'),
  ('USR-022', 'Sửa máy giặt inverter LG'), ('USR-022', 'Cân bằng lồng giặt'), ('USR-022', 'Thay dây curoa'),
  ('USR-023', 'Sửa tủ lạnh gia đình'), ('USR-023', 'Bảo dưỡng tủ lạnh'), ('USR-023', 'Kiểm tra block'),
  ('USR-024', 'Thay tụ máy lạnh'), ('USR-024', 'Sửa quạt dàn nóng'), ('USR-024', 'Vệ sinh máy lạnh sâu'),
  ('USR-025', 'Lắp máy nước nóng trực tiếp'), ('USR-025', 'Sửa thiết bị vệ sinh'), ('USR-025', 'Thông tắc cống'),
  ('USR-026', 'Sửa máy giặt Samsung'), ('USR-026', 'Thay bơm xả máy giặt'), ('USR-026', 'Sửa bo mạch điều khiển'),
  ('USR-027', 'Vệ sinh máy lạnh multi'), ('USR-027', 'Sửa máy lạnh chung cư'), ('USR-027', 'Xử lý lỗi block'),
  ('USR-028', 'Sửa tủ lạnh inverter'), ('USR-028', 'Thay board tủ lạnh'), ('USR-028', 'Xử lý kém lạnh'),
  ('USR-029', 'Lắp bình nóng lạnh gián tiếp'), ('USR-029', 'Sửa điện gia dụng'), ('USR-029', 'Thay dây điện'),
  ('USR-030', 'Vệ sinh máy lạnh giá rẻ'), ('USR-030', 'Sửa máy lạnh cơ bản'), ('USR-030', 'Bảo trì điện tử')
) AS v(code, skill)
WHERE u.code = v.code
  AND NOT EXISTS (SELECT 1 FROM technician_skills ts WHERE ts.profile_id = tp.id AND ts.skill = v.skill);

-- 5. TECHNICIAN SERVICE AREAS
INSERT INTO technician_service_areas (profile_id, area)
SELECT tp.id, a.area
FROM technician_profiles tp
JOIN users u ON tp.user_id = u.id
CROSS JOIN LATERAL (VALUES
  ('USR-004', 'Quận Phú Nhuận'), ('USR-004', 'Quận 3'), ('USR-004', 'Bình Thạnh'),
  ('USR-005', 'Quận Gò Vấp'), ('USR-005', 'Quận 12'), ('USR-005', 'Tân Bình'),
  ('USR-006', 'Quận Tân Phú'), ('USR-006', 'Tân Bình'), ('USR-006', 'Bình Tân'),
  ('USR-009', 'Quận 3'), ('USR-009', 'Quận 1'), ('USR-009', 'Phú Nhuận'),
  ('USR-010', 'Quận 12'), ('USR-010', 'Gò Vấp'), ('USR-010', 'Tân Bình'),
  ('USR-011', 'Quận 1'), ('USR-011', 'Quận 3'), ('USR-011', 'Bình Thạnh'),
  ('USR-012', 'Quận 2'), ('USR-012', 'Quận 9'), ('USR-012', 'Thủ Đức'),
  ('USR-013', 'Quận 3'), ('USR-013', 'Quận 10'), ('USR-013', 'Tân Bình'),
  ('USR-014', 'Quận 4'), ('USR-014', 'Quận 7'), ('USR-014', 'Nhà Bè'),
  ('USR-015', 'Quận 5'), ('USR-015', 'Quận 6'), ('USR-015', 'Quận 11'),
  ('USR-016', 'Quận 6'), ('USR-016', 'Tân Phú'), ('USR-016', 'Bình Tân'),
  ('USR-017', 'Quận 7'), ('USR-017', 'Quận 8'), ('USR-017', 'Nhà Bè'),
  ('USR-018', 'Quận 8'), ('USR-018', 'Bình Chánh'), ('USR-018', 'Quận 6'),
  ('USR-019', 'Quận 9'), ('USR-019', 'Thủ Đức'), ('USR-019', 'Quận 2'),
  ('USR-020', 'Quận 10'), ('USR-020', 'Quận 11'), ('USR-020', 'Tân Bình'),
  ('USR-021', 'Quận 11'), ('USR-021', 'Quận 5'), ('USR-021', 'Quận 10'),
  ('USR-022', 'Quận 12'), ('USR-022', 'Hóc Môn'), ('USR-022', 'Củ Chi'),
  ('USR-023', 'Bình Thạnh'), ('USR-023', 'Quận 1'), ('USR-023', 'Phú Nhuận'),
  ('USR-024', 'Gò Vấp'), ('USR-024', 'Quận 12'), ('USR-024', 'Tân Bình'),
  ('USR-025', 'Tân Bình'), ('USR-025', 'Tân Phú'), ('USR-025', 'Quận 11'),
  ('USR-026', 'Tân Phú'), ('USR-026', 'Bình Tân'), ('USR-026', 'Quận 6'),
  ('USR-027', 'Phú Nhuận'), ('USR-027', 'Quận 3'), ('USR-027', 'Bình Thạnh'),
  ('USR-028', 'Thủ Đức'), ('USR-028', 'Quận 9'), ('USR-028', 'Quận 2'),
  ('USR-029', 'Bình Tân'), ('USR-029', 'Tân Phú'), ('USR-029', 'Bình Chánh'),
  ('USR-030', 'Nhà Bè'), ('USR-030', 'Quận 7'), ('USR-030', 'Bình Chánh')
) AS a(code, area)
WHERE u.code = a.code
  AND NOT EXISTS (SELECT 1 FROM technician_service_areas ta WHERE ta.profile_id = tp.id AND ta.area = a.area);


-- 6. ORDERS & REVIEWS
-- GU-88421: completed — Hai (USR-002) -> Huy (USR-004)
INSERT INTO orders (code, service_name, sub_service, service_category, device_name, description,
                    address, scheduled_at, started_at, completed_at,
                    estimated_price, final_price, payment_method, warranty_months,
                    status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-88421',
       'Bảo trì máy lạnh', 'Vệ sinh sâu + kiểm tra áp gas', 'Máy lạnh',
       'Máy lạnh Panasonic Inverter 2HP',
       'Máy lạnh chạy yếu và có mùi ẩm, cần vệ sinh tổng thể và kiểm tra dàn lạnh.',
       '55 Đường số 12, Khu đô thị An Phú',
       NOW() - INTERVAL '3 days',
       NOW() - INTERVAL '3 days' + INTERVAL '5 minutes',
       NOW() - INTERVAL '3 days' + INTERVAL '95 minutes',
       520000, 520000, 'MOMO', 4,
       'COMPLETED',
       (SELECT id FROM users WHERE code = 'USR-002'),
       (SELECT id FROM users WHERE code = 'USR-004'),
       FALSE, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-88421');

INSERT INTO order_images (order_id, url, role, created_at)
SELECT o.id, 'https://images.unsplash.com/photo-1581093458791-9d42f6e8a3d3', 'request', NOW()
FROM orders o WHERE o.code = 'GU-88421'
  AND NOT EXISTS (SELECT 1 FROM order_images oi WHERE oi.order_id = o.id);

INSERT INTO reviews (code, order_id, author_id, technician_id, rating, content, created_at)
SELECT 'REV-101', o.id, (SELECT id FROM users WHERE code = 'USR-002'),
       (SELECT id FROM users WHERE code = 'USR-004'),
       5, 'Anh Huy tới đúng giờ, làm sạch dàn lạnh kỹ và tư vấn cách dùng máy tiết kiệm điện rất dễ hiểu.',
       NOW() - INTERVAL '2 days'
FROM orders o WHERE o.code = 'GU-88421'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE code = 'REV-101');

-- GU-88439: new — Linh (USR-003)
INSERT INTO orders (code, service_name, service_category, device_name, description,
                    address, expected_time, estimated_price,
                    status, customer_id, deleted, created_at, updated_at)
SELECT 'GU-88439', NULL, 'Máy giặt', 'Máy giặt cửa trước Electrolux 10kg',
       'Máy giặt báo lỗi khi xả nước và rung mạnh ở chu kỳ vắt cuối.',
       '102 Thành Thái, Quận 10', NOW() + INTERVAL '1 day', 480000,
       'NEW', (SELECT id FROM users WHERE code = 'USR-003'),
       FALSE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-88439');

-- GU-88452: completed — Bao (USR-007) -> Nam (USR-009)
INSERT INTO orders (code, service_name, sub_service, service_category, device_name, description,
                    address, scheduled_at, started_at, completed_at,
                    estimated_price, final_price, payment_method, warranty_months,
                    status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-88452', 'Sửa tủ lạnh', 'Kiểm tra xì gas + vệ sinh dàn nóng', 'Tủ lạnh',
       'Tủ lạnh Toshiba Inverter 420L',
       'Ngăn mát không đủ lạnh, ngăn đá vẫn hoạt động nhưng có đóng tuyết nhẹ.',
       '12 Nguyễn Thị Thập, Quận 7',
       NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '20 minutes',
       NOW() - INTERVAL '6 days' + INTERVAL '2 hours',
       650000, 720000, 'CASH', 2, 'COMPLETED',
       (SELECT id FROM users WHERE code = 'USR-007'),
       (SELECT id FROM users WHERE code = 'USR-009'),
       FALSE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-88452');

INSERT INTO reviews (code, order_id, author_id, technician_id, rating, content, created_at)
SELECT 'REV-102', o.id, (SELECT id FROM users WHERE code = 'USR-007'),
       (SELECT id FROM users WHERE code = 'USR-009'),
       4, 'Anh Nam xử lý nhanh, tủ lạnh mát ổn định trở lại sau khi sửa và có dặn cách theo dõi thêm.',
       NOW() - INTERVAL '5 days'
FROM orders o WHERE o.code = 'GU-88452'
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE code = 'REV-102');

-- GU-88461: accepted — My (USR-008) -> Khoa (USR-010)
INSERT INTO orders (code, service_name, service_category, device_name, description,
                    address, scheduled_at, estimated_price,
                    status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-88461', 'Lắp máy nước nóng', 'Máy nước nóng', 'Máy nước nóng Ariston 30L',
       'Cần lắp mới máy nước nóng và kiểm tra lại aptomat tổng trước khi sử dụng.',
       '88 Xô Viết Nghệ Tĩnh, Bình Thạnh', NOW() + INTERVAL '2 days', 550000,
       'SCHEDULED', (SELECT id FROM users WHERE code = 'USR-008'),
       (SELECT id FROM users WHERE code = 'USR-010'),
       FALSE, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 hours'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-88461');

-- GU-88474: new — Bao (USR-007)
INSERT INTO orders (code, service_name, service_category, device_name, description,
                    address, expected_time, estimated_price,
                    status, customer_id, deleted, created_at, updated_at)
SELECT 'GU-88474', NULL, 'Máy lạnh', 'Máy lạnh Casper 1HP',
       'Máy lạnh bật lên có gió nhưng không lạnh, cần kiểm tra nhanh trong chiều nay.',
       '19 Bạch Đằng, Tân Bình', NOW() + INTERVAL '8 hours', 350000,
       'NEW', (SELECT id FROM users WHERE code = 'USR-007'),
       FALSE, NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-88474');

-- ORDERS for new technicians (USR-011 ~ USR-030) — 3 completed orders each
INSERT INTO orders (code, service_name, sub_service, service_category, device_name, description,
                    address, scheduled_at, started_at, completed_at,
                    estimated_price, final_price, payment_method, warranty_months,
                    status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT v.code, v.service_name, v.sub_service, v.service_category, v.device_name,
       '', v.address, v.scheduled_at, v.started_at, v.completed_at,
       v.estimated_price, v.final_price, v.payment_method, v.warranty_months,
       v.status, ids.cid, ids.tid, FALSE, v.scheduled_at - INTERVAL '1 day', v.completed_at
FROM (VALUES
  ('GU-NEW-011A', 'Vệ sinh máy lạnh', 'Vệ sinh sâu dàn lạnh', 'Máy lạnh', 'Máy lạnh Daikin 1.5HP',
   '33 Nguyễn Huệ, Quận 1', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '10 min',
   NOW() - INTERVAL '10 days' + INTERVAL '2 hours', 350000, 350000, 'MOMO', 6, 'COMPLETED', 'USR-002', 'USR-011'),
  ('GU-NEW-011B', 'Sửa máy lạnh', 'Xử lý rò nước dàn lạnh', 'Máy lạnh', 'Máy lạnh Panasonic 2HP',
   '78 Lê Lợi, Quận 1', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '15 min',
   NOW() - INTERVAL '8 days' + INTERVAL '3 hours', 450000, 500000, 'BANK_TRANSFER', 6, 'COMPLETED', 'USR-003', 'USR-011'),
  ('GU-NEW-011C', 'Bơm gas máy lạnh', 'Nạp gas R32', 'Máy lạnh', 'Máy lạnh LG Inverter 1HP',
   '15 Hai Bà Trưng, Quận 1', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '5 min',
   NOW() - INTERVAL '6 days' + INTERVAL '1 hour', 600000, 600000, 'MOMO', 0, 'COMPLETED', 'USR-007', 'USR-011'),
  ('GU-NEW-012A', 'Sửa máy giặt', 'Thay vòng bi', 'Máy giặt', 'Máy giặt Electrolux 9kg',
   '44 Thảo Điền, Quận 2', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '10 min',
   NOW() - INTERVAL '12 days' + INTERVAL '2.5 hours', 380000, 420000, 'CASH', 3, 'COMPLETED', 'USR-002', 'USR-012'),
  ('GU-NEW-012B', 'Sửa máy giặt', 'Sửa lỗi không vắt', 'Máy giặt', 'Máy giặt Samsung 8kg',
   '99 Lương Định Của, Quận 2', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days' + INTERVAL '5 min',
   NOW() - INTERVAL '9 days' + INTERVAL '1.5 hours', 280000, 320000, 'MOMO', 3, 'COMPLETED', 'USR-008', 'USR-012'),
  ('GU-NEW-012C', 'Sửa máy giặt', 'Thay bơm xả', 'Máy giặt', 'Máy giặt LG Inverter 10kg',
   '55 Xa lộ Hà Nội, Quận 2', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '10 min',
   NOW() - INTERVAL '5 days' + INTERVAL '2 hours', 320000, 350000, 'BANK_TRANSFER', 3, 'COMPLETED', 'USR-007', 'USR-012'),
  ('GU-NEW-013A', 'Vệ sinh máy lạnh', 'Vệ sinh tổng thể', 'Máy lạnh', 'Máy lạnh Toshiba 1HP',
   '22 Võ Văn Tần, Quận 3', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '5 min',
   NOW() - INTERVAL '14 days' + INTERVAL '1.5 hours', 250000, 300000, 'MOMO', 0, 'COMPLETED', 'USR-003', 'USR-013'),
  ('GU-NEW-013B', 'Sửa máy lạnh', 'Xử lý block kêu to', 'Máy lạnh', 'Máy lạnh Gree 2HP',
   '66 Cách Mạng Tháng 8, Quận 3', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '5 min',
   NOW() - INTERVAL '11 days' + INTERVAL '3 hours', 500000, 550000, 'BANK_TRANSFER', 6, 'COMPLETED', 'USR-002', 'USR-013'),
  ('GU-NEW-013C', 'Bảo trì máy lạnh', 'Vệ sinh + kiểm tra gas', 'Máy lạnh', 'Máy lạnh Daikin 2.5HP',
   '12 Nguyễn Đình Chiểu, Quận 3', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '5 min',
   NOW() - INTERVAL '7 days' + INTERVAL '2 hours', 400000, 450000, 'MOMO', 6, 'COMPLETED', 'USR-008', 'USR-013'),
  ('GU-NEW-014A', 'Sửa tủ lạnh', 'Xì gas dàn nóng', 'Tủ lạnh', 'Tủ lạnh Side by Side Samsung 500L',
   '28 Tôn Đản, Quận 4', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '10 min',
   NOW() - INTERVAL '15 days' + INTERVAL '4 hours', 700000, 800000, 'CASH', 6, 'COMPLETED', 'USR-003', 'USR-014'),
  ('GU-NEW-014B', 'Sửa tủ lạnh', 'Thay block', 'Tủ lạnh', 'Tủ lạnh LG 350L',
   '77 Hoàng Diệu, Quận 4', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '10 min',
   NOW() - INTERVAL '10 days' + INTERVAL '5 hours', 1200000, 1350000, 'MOMO', 12, 'COMPLETED', 'USR-007', 'USR-014'),
  ('GU-NEW-014C', 'Bảo dưỡng tủ lạnh', 'Vệ sinh dàn nóng lạnh', 'Tủ lạnh', 'Tủ lạnh Toshiba 420L',
   '39 Nguyễn Tất Thành, Quận 4', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '5 min',
   NOW() - INTERVAL '3 days' + INTERVAL '2 hours', 350000, 400000, 'BANK_TRANSFER', 0, 'COMPLETED', 'USR-002', 'USR-014'),
  ('GU-NEW-015A', 'Lắp máy nước nóng', 'Lắp bình nóng lạnh', 'Máy nước nóng', 'Bình nóng lạnh Ariston 30L',
   '88 Trần Hưng Đạo, Quận 5', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '15 min',
   NOW() - INTERVAL '20 days' + INTERVAL '3 hours', 500000, 550000, 'MOMO', 24, 'COMPLETED', 'USR-008', 'USR-015'),
  ('GU-NEW-015B', 'Sửa máy nước nóng', 'Thay rơ le nhiệt', 'Máy nước nóng', 'Bình nóng lạnh Ferroli 20L',
   '52 Nguyễn Trãi, Quận 5', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days' + INTERVAL '5 min',
   NOW() - INTERVAL '16 days' + INTERVAL '1 hour', 200000, 250000, 'CASH', 0, 'COMPLETED', 'USR-003', 'USR-015'),
  ('GU-NEW-015C', 'Lắp máy nước nóng NLMT', 'Lắp hệ thống NLMT', 'Máy nước nóng', 'Máy nước nóng NLMT 200L',
   '15 An Dương Vương, Quận 5', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '20 min',
   NOW() - INTERVAL '12 days' + INTERVAL '6 hours', 2500000, 2800000, 'BANK_TRANSFER', 24, 'COMPLETED', 'USR-007', 'USR-015'),
  ('GU-NEW-016A', 'Vệ sinh máy lạnh âm trần', 'Vệ sinh dàn lạnh âm trần', 'Máy lạnh', 'Máy lạnh âm trần Daikin 3HP',
   '65 Hậu Giang, Quận 6', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '10 min',
   NOW() - INTERVAL '10 days' + INTERVAL '3 hours', 800000, 800000, 'MOMO', 6, 'COMPLETED', 'USR-002', 'USR-016'),
  ('GU-NEW-016B', 'Bảo trì máy lạnh', 'Bảo trì hệ thống VRV', 'Máy lạnh', 'Hệ thống VRV Daikin 4 dàn',
   '180 Bình Tây, Quận 6', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '15 min',
   NOW() - INTERVAL '7 days' + INTERVAL '5 hours', 1500000, 1800000, 'BANK_TRANSFER', 6, 'COMPLETED', 'USR-008', 'USR-016'),
  ('GU-NEW-016C', 'Sửa máy lạnh', 'Xử lý lỗi board mạch', 'Máy lạnh', 'Máy lạnh LG inverter 1.5HP',
   '45 Phạm Văn Chí, Quận 6', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '5 min',
   NOW() - INTERVAL '4 days' + INTERVAL '2.5 hours', 550000, 600000, 'MOMO', 6, 'COMPLETED', 'USR-007', 'USR-016'),
  ('GU-NEW-017A', 'Sửa máy giặt', 'Sửa lỗi E4', 'Máy giặt', 'Máy giặt Electrolux 10kg',
   '88 Nguyễn Lương Bằng, Quận 7', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days' + INTERVAL '5 min',
   NOW() - INTERVAL '13 days' + INTERVAL '1.5 hours', 300000, 350000, 'MOMO', 3, 'COMPLETED', 'USR-003', 'USR-017'),
  ('GU-NEW-017B', 'Sửa máy sấy', 'Thay dây curoa', 'Máy giặt', 'Máy sấy Samsung 8kg',
   '24 Phạm Hữu Lầu, Quận 7', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days' + INTERVAL '5 min',
   NOW() - INTERVAL '9 days' + INTERVAL '1 hour', 280000, 300000, 'CASH', 3, 'COMPLETED', 'USR-008', 'USR-017'),
  ('GU-NEW-017C', 'Sửa máy giặt', 'Thay bơm xả', 'Máy giặt', 'Máy giặt LG 9kg',
   '55 Nguyễn Thị Thập, Quận 7', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '10 min',
   NOW() - INTERVAL '5 days' + INTERVAL '1.5 hours', 250000, 300000, 'MOMO', 3, 'COMPLETED', 'USR-002', 'USR-017'),
  ('GU-NEW-018A', 'Vệ sinh máy lạnh', 'Vệ sinh nhanh', 'Máy lạnh', 'Máy lạnh Sharp 1HP',
   '12 Phạm Thế Hiển, Quận 8', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '5 min',
   NOW() - INTERVAL '18 days' + INTERVAL '1 hour', 180000, 200000, 'CASH', 0, 'COMPLETED', 'USR-007', 'USR-018'),
  ('GU-NEW-018B', 'Sửa máy lạnh', 'Xử lý không lạnh', 'Máy lạnh', 'Máy lạnh Panasonic 1.5HP',
   '33 Tạ Quang Bửu, Quận 8', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '5 min',
   NOW() - INTERVAL '14 days' + INTERVAL '2 hours', 400000, 450000, 'BANK_TRANSFER', 3, 'COMPLETED', 'USR-003', 'USR-018'),
  ('GU-NEW-018C', 'Bảo trì máy lạnh', 'Vệ sinh + kiểm tra', 'Máy lạnh', 'Máy lạnh Daikin 2HP',
   '78 Cao Lỗ, Quận 8', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '5 min',
   NOW() - INTERVAL '8 days' + INTERVAL '2 hours', 350000, 400000, 'MOMO', 6, 'COMPLETED', 'USR-008', 'USR-018'),
  ('GU-NEW-019A', 'Sửa tủ lạnh', 'Sửa tủ đông', 'Tủ lạnh', 'Tủ đông Sanaky 200L',
   '55 Lê Văn Việt, Quận 9', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '10 min',
   NOW() - INTERVAL '20 days' + INTERVAL '3 hours', 500000, 600000, 'MOMO', 6, 'COMPLETED', 'USR-002', 'USR-019'),
  ('GU-NEW-019B', 'Sửa tủ lạnh', 'Xử lý kém lạnh', 'Tủ lạnh', 'Tủ lạnh Hitachi 380L',
   '22 Đỗ Xuân Hợp, Quận 9', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days' + INTERVAL '5 min',
   NOW() - INTERVAL '16 days' + INTERVAL '2 hours', 400000, 480000, 'BANK_TRANSFER', 6, 'COMPLETED', 'USR-007', 'USR-019'),
  ('GU-NEW-019C', 'Bảo dưỡng tủ lạnh', 'Vệ sinh dàn nóng', 'Tủ lạnh', 'Tủ lạnh Toshiba 400L',
   '99 Nguyễn Văn Tăng, Quận 9', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '5 min',
   NOW() - INTERVAL '10 days' + INTERVAL '1.5 hours', 300000, 350000, 'MOMO', 0, 'COMPLETED', 'USR-008', 'USR-019'),
  ('GU-NEW-020A', 'Lắp máy nước nóng', 'Lắp bình nóng lạnh', 'Máy nước nóng', 'Bình nóng lạnh Panasonic 30L',
   '66 Lý Thường Kiệt, Quận 10', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '10 min',
   NOW() - INTERVAL '14 days' + INTERVAL '2.5 hours', 450000, 500000, 'MOMO', 24, 'COMPLETED', 'USR-003', 'USR-020'),
  ('GU-NEW-020B', 'Sửa điện dân dụng', 'Thay aptomat tổng', 'Máy nước nóng', 'Aptomat Schneider 63A',
   '42 Ngô Gia Tự, Quận 10', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '5 min',
   NOW() - INTERVAL '11 days' + INTERVAL '1 hour', 250000, 300000, 'CASH', 0, 'COMPLETED', 'USR-002', 'USR-020'),
  ('GU-NEW-020C', 'Sửa máy nước nóng', 'Thay thanh đốt', 'Máy nước nóng', 'Bình nóng lạnh Ferroli 30L',
   '88 Nguyễn Chí Thanh, Quận 10', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '5 min',
   NOW() - INTERVAL '6 days' + INTERVAL '1 hour', 350000, 400000, 'BANK_TRANSFER', 3, 'COMPLETED', 'USR-007', 'USR-020'),
  ('GU-NEW-021A', 'Bảo trì máy lạnh', 'Vệ sinh + bơm gas', 'Máy lạnh', 'Máy lạnh Panasonic 1.5HP',
   '34 Lãnh Binh Thăng, Quận 11', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days' + INTERVAL '5 min',
   NOW() - INTERVAL '17 days' + INTERVAL '2 hours', 500000, 550000, 'MOMO', 6, 'COMPLETED', 'USR-008', 'USR-021'),
  ('GU-NEW-021B', 'Sửa máy lạnh', 'Sửa lỗi rò nước', 'Máy lạnh', 'Máy lạnh Daikin 2HP',
   '55 Thuận Kiều, Quận 11', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days' + INTERVAL '5 min',
   NOW() - INTERVAL '13 days' + INTERVAL '2 hours', 350000, 380000, 'CASH', 3, 'COMPLETED', 'USR-007', 'USR-021'),
  ('GU-NEW-021C', 'Vệ sinh dàn nóng', 'Vệ sinh dàn nóng máy lạnh', 'Máy lạnh', 'Dàn nóng LG 2HP',
   '22 Bình Thới, Quận 11', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days' + INTERVAL '5 min',
   NOW() - INTERVAL '9 days' + INTERVAL '1 hour', 200000, 250000, 'MOMO', 0, 'COMPLETED', 'USR-003', 'USR-021'),
  ('GU-NEW-022A', 'Sửa máy giặt', 'Thay dây curoa', 'Máy giặt', 'Máy giặt LG Inverter 8kg',
   '28 Trường Chinh, Quận 12', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days' + INTERVAL '5 min',
   NOW() - INTERVAL '19 days' + INTERVAL '1 hour', 200000, 250000, 'BANK_TRANSFER', 3, 'COMPLETED', 'USR-002', 'USR-022'),
  ('GU-NEW-022B', 'Sửa máy giặt', 'Thay vòng bi', 'Máy giặt', 'Máy giặt Samsung 8kg',
   '77 Nguyễn Văn Quá, Quận 12', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '5 min',
   NOW() - INTERVAL '15 days' + INTERVAL '2.5 hours', 380000, 450000, 'MOMO', 3, 'COMPLETED', 'USR-008', 'USR-022'),
  ('GU-NEW-022C', 'Sửa máy giặt', 'Sửa bo mạch', 'Máy giặt', 'Máy giặt Electrolux 9kg',
   '44 Tô Ký, Quận 12', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '10 min',
   NOW() - INTERVAL '10 days' + INTERVAL '2 hours', 600000, 700000, 'BANK_TRANSFER', 6, 'COMPLETED', 'USR-007', 'USR-022'),
  ('GU-NEW-023A', 'Sửa tủ lạnh', 'Kiểm tra block', 'Tủ lạnh', 'Tủ lạnh Aqua 300L',
   '55 Phan Văn Trị, Bình Thạnh', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days' + INTERVAL '5 min',
   NOW() - INTERVAL '22 days' + INTERVAL '2 hours', 300000, 350000, 'CASH', 3, 'COMPLETED', 'USR-003', 'USR-023'),
  ('GU-NEW-023B', 'Bảo dưỡng tủ lạnh', 'Vệ sinh tủ lạnh', 'Tủ lạnh', 'Tủ lạnh Panasonic 400L',
   '33 Xô Viết Nghệ Tĩnh, Bình Thạnh', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days' + INTERVAL '5 min',
   NOW() - INTERVAL '17 days' + INTERVAL '1.5 hours', 250000, 300000, 'MOMO', 0, 'COMPLETED', 'USR-008', 'USR-023'),
  ('GU-NEW-023C', 'Sửa tủ lạnh', 'Xử lý đóng tuyết', 'Tủ lạnh', 'Tủ lạnh Hitachi 350L',
   '12 Nơ Trang Long, Bình Thạnh', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '10 min',
   NOW() - INTERVAL '8 days' + INTERVAL '2 hours', 400000, 450000, 'BANK_TRANSFER', 6, 'COMPLETED', 'USR-002', 'USR-023'),
  ('GU-NEW-024A', 'Vệ sinh máy lạnh', 'Vệ sinh + kiểm tra gas', 'Máy lạnh', 'Máy lạnh Gree 1.5HP',
   '88 Quang Trung, Gò Vấp', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days' + INTERVAL '10 min',
   NOW() - INTERVAL '16 days' + INTERVAL '1.5 hours', 350000, 400000, 'MOMO', 6, 'COMPLETED', 'USR-007', 'USR-024'),
  ('GU-NEW-024B', 'Sửa máy lạnh', 'Thay tụ máy lạnh', 'Máy lạnh', 'Máy lạnh Toshiba 1HP',
   '22 Phạm Văn Chiêu, Gò Vấp', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '5 min',
   NOW() - INTERVAL '12 days' + INTERVAL '1 hour', 250000, 300000, 'CASH', 0, 'COMPLETED', 'USR-008', 'USR-024'),
  ('GU-NEW-024C', 'Sửa máy lạnh', 'Xử lý block kêu', 'Máy lạnh', 'Máy lạnh Daikin 2HP',
   '45 Phan Huy Ích, Gò Vấp', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '5 min',
   NOW() - INTERVAL '6 days' + INTERVAL '2 hours', 500000, 550000, 'MOMO', 6, 'COMPLETED', 'USR-003', 'USR-024'),
  ('GU-NEW-025A', 'Lắp máy nước nóng', 'Lắp bình nóng lạnh trực tiếp', 'Máy nước nóng', 'Máy nước nóng trực tiếp Panasonic',
   '30 Bạch Đằng, Tân Bình', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days' + INTERVAL '10 min',
   NOW() - INTERVAL '21 days' + INTERVAL '2 hours', 400000, 450000, 'MOMO', 12, 'COMPLETED', 'USR-002', 'USR-025'),
  ('GU-NEW-025B', 'Thông tắc cống', 'Thông tắc bồn rửa', 'Máy nước nóng', 'Bồn rửa bát inox',
   '66 Trường Sơn, Tân Bình', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days' + INTERVAL '5 min',
   NOW() - INTERVAL '16 days' + INTERVAL '1 hour', 200000, 250000, 'CASH', 0, 'COMPLETED', 'USR-007', 'USR-025'),
  ('GU-NEW-025C', 'Sửa máy nước nóng', 'Thay rơ le', 'Máy nước nóng', 'Bình nóng lạnh Ariston 20L',
   '99 Cộng Hòa, Tân Bình', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '5 min',
   NOW() - INTERVAL '10 days' + INTERVAL '1 hour', 250000, 300000, 'BANK_TRANSFER', 3, 'COMPLETED', 'USR-008', 'USR-025'),
  ('GU-NEW-026A', 'Sửa máy giặt', 'Sửa lỗi không xả nước', 'Máy giặt', 'Máy giặt Samsung 7kg',
   '52 Lũy Bán Bích, Tân Phú', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days' + INTERVAL '5 min',
   NOW() - INTERVAL '24 days' + INTERVAL '1.5 hours', 280000, 320000, 'MOMO', 3, 'COMPLETED', 'USR-003', 'USR-026'),
  ('GU-NEW-026B', 'Sửa máy giặt', 'Thay bơm xả', 'Máy giặt', 'Máy giặt LG 8kg',
   '18 Tân Hương, Tân Phú', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '5 min',
   NOW() - INTERVAL '18 days' + INTERVAL '1.5 hours', 300000, 350000, 'BANK_TRANSFER', 3, 'COMPLETED', 'USR-008', 'USR-026'),
  ('GU-NEW-026C', 'Sửa máy giặt', 'Sửa lỗi E7', 'Máy giặt', 'Máy giặt Electrolux 10kg',
   '77 Lê Trọng Tấn, Tân Phú', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '5 min',
   NOW() - INTERVAL '7 days' + INTERVAL '2 hours', 350000, 400000, 'MOMO', 6, 'COMPLETED', 'USR-002', 'USR-026'),
  ('GU-NEW-027A', 'Vệ sinh máy lạnh multi', 'Vệ sinh 3 dàn lạnh', 'Máy lạnh', 'Hệ thống Daikin Multi 3 dàn',
   '55 Phan Đình Phùng, Phú Nhuận', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '15 min',
   NOW() - INTERVAL '15 days' + INTERVAL '4 hours', 900000, 1000000, 'MOMO', 6, 'COMPLETED', 'USR-007', 'USR-027'),
  ('GU-NEW-027B', 'Sửa máy lạnh', 'Xử lý lỗi block', 'Máy lạnh', 'Máy lạnh Mitsubishi 2HP',
   '33 Nguyễn Văn Trỗi, Phú Nhuận', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '5 min',
   NOW() - INTERVAL '10 days' + INTERVAL '3 hours', 800000, 900000, 'BANK_TRANSFER', 12, 'COMPLETED', 'USR-008', 'USR-027'),
  ('GU-NEW-027C', 'Bảo trì máy lạnh', 'Bảo trì chung cư', 'Máy lạnh', 'Máy lạnh LG 1.5HP',
   '88 Hoàng Văn Thụ, Phú Nhuận', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '5 min',
   NOW() - INTERVAL '5 days' + INTERVAL '1.5 hours', 350000, 400000, 'MOMO', 6, 'COMPLETED', 'USR-003', 'USR-027'),
  ('GU-NEW-028A', 'Sửa tủ lạnh', 'Sửa board tủ lạnh', 'Tủ lạnh', 'Tủ lạnh Samsung Inverter 450L',
   '23 Xa lộ Hà Nội, Thủ Đức', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '10 min',
   NOW() - INTERVAL '20 days' + INTERVAL '3 hours', 650000, 750000, 'MOMO', 12, 'COMPLETED', 'USR-002', 'USR-028'),
  ('GU-NEW-028B', 'Sửa tủ lạnh', 'Xử lý kém lạnh', 'Tủ lạnh', 'Tủ lạnh Panasonic 380L',
   '55 Võ Văn Ngân, Thủ Đức', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '5 min',
   NOW() - INTERVAL '14 days' + INTERVAL '2.5 hours', 450000, 500000, 'BANK_TRANSFER', 6, 'COMPLETED', 'USR-008', 'USR-028'),
  ('GU-NEW-028C', 'Bảo dưỡng tủ lạnh', 'Vệ sinh tủ lạnh', 'Tủ lạnh', 'Tủ lạnh LG 400L',
   '99 Tô Ngọc Vân, Thủ Đức', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '5 min',
   NOW() - INTERVAL '8 days' + INTERVAL '1.5 hours', 280000, 350000, 'MOMO', 0, 'COMPLETED', 'USR-007', 'USR-028'),
  ('GU-NEW-029A', 'Lắp bình nóng lạnh', 'Lắp bình gián tiếp', 'Máy nước nóng', 'Bình nóng lạnh Stiebel 40L',
   '82 Hương lộ 2, Bình Tân', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '15 min',
   NOW() - INTERVAL '18 days' + INTERVAL '3 hours', 500000, 550000, 'MOMO', 24, 'COMPLETED', 'USR-003', 'USR-029'),
  ('GU-NEW-029B', 'Sửa điện dân dụng', 'Thay dây điện', 'Máy nước nóng', 'Dây điện CADIVI 2.5mm',
   '44 Mã Lò, Bình Tân', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days' + INTERVAL '5 min',
   NOW() - INTERVAL '13 days' + INTERVAL '2 hours', 350000, 400000, 'CASH', 0, 'COMPLETED', 'USR-008', 'USR-029'),
  ('GU-NEW-029C', 'Sửa máy nước nóng', 'Thay thanh đốt', 'Máy nước nóng', 'Bình nóng lạnh Ferroli 30L',
   '66 Tên Lửa, Bình Tân', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days' + INTERVAL '5 min',
   NOW() - INTERVAL '9 days' + INTERVAL '1 hour', 300000, 350000, 'BANK_TRANSFER', 3, 'COMPLETED', 'USR-007', 'USR-029'),
  ('GU-NEW-030A', 'Vệ sinh máy lạnh', 'Vệ sinh máy lạnh gia đình', 'Máy lạnh', 'Máy lạnh Casper 1HP',
   '18 Nguyễn Văn Tạo, Nhà Bè', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days' + INTERVAL '5 min',
   NOW() - INTERVAL '23 days' + INTERVAL '1.5 hours', 250000, 300000, 'MOMO', 0, 'COMPLETED', 'USR-002', 'USR-030'),
  ('GU-NEW-030B', 'Sửa máy lạnh', 'Bơm gas', 'Máy lạnh', 'Máy lạnh Gree 1HP',
   '55 Lê Văn Lương, Nhà Bè', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days' + INTERVAL '5 min',
   NOW() - INTERVAL '16 days' + INTERVAL '1.5 hours', 450000, 500000, 'MOMO', 6, 'COMPLETED', 'USR-008', 'USR-030'),
  ('GU-NEW-030C', 'Bảo trì máy lạnh', 'Bảo trì định kỳ', 'Máy lạnh', 'Máy lạnh Daikin 2HP',
   '33 Nguyễn Bình, Nhà Bè', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '5 min',
   NOW() - INTERVAL '10 days' + INTERVAL '2 hours', 350000, 400000, 'BANK_TRANSFER', 6, 'COMPLETED', 'USR-007', 'USR-030')
) AS v(code, service_name, sub_service, service_category, device_name, address,
       scheduled_at, started_at, completed_at, estimated_price, final_price,
       payment_method, warranty_months, status, customer_code, technician_code)
CROSS JOIN LATERAL (
  SELECT cu.id AS cid, te.id AS tid
  FROM users cu, users te
  WHERE cu.code = v.customer_code AND te.code = v.technician_code
) AS ids
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.code = v.code);

-- Reviews for all new orders
INSERT INTO reviews (code, order_id, author_id, technician_id, rating, content, created_at)
SELECT v.code, o.oid, a.auid, t.tid, v.rating, v.content, v.created_at
FROM (VALUES
  ('REV-201', 'GU-NEW-011A', 'USR-002', 'USR-011', 5, 'Vệ sinh rất sạch, máy lạnh chạy êm và mát hẳn lên. Rất hài lòng!', NOW() - INTERVAL '9 days'),
  ('REV-202', 'GU-NEW-011B', 'USR-003', 'USR-011', 4, 'Xử lý rò nước tốt, chỉ hơi lâu một chút nhưng ok.', NOW() - INTERVAL '7 days'),
  ('REV-203', 'GU-NEW-011C', 'USR-007', 'USR-011', 5, 'Nạp gas nhanh gọn, máy lạnh mát lạnh ngay. Cảm ơn anh!', NOW() - INTERVAL '5 days'),
  ('REV-204', 'GU-NEW-012A', 'USR-002', 'USR-012', 4, 'Thay vòng bi máy giặt, hết kêu, chạy êm. Giá hợp lý.', NOW() - INTERVAL '11 days'),
  ('REV-205', 'GU-NEW-012B', 'USR-008', 'USR-012', 5, 'Sửa nhanh, máy giặt hoạt động bình thường trở lại.', NOW() - INTERVAL '8 days'),
  ('REV-206', 'GU-NEW-012C', 'USR-007', 'USR-012', 3, 'Tạm ổn, nhưng thợ đến hơi trễ so với giờ hẹn.', NOW() - INTERVAL '4 days'),
  ('REV-207', 'GU-NEW-013A', 'USR-003', 'USR-013', 5, 'Vệ sinh nhanh sạch, giá rẻ. Sẽ gọi lại!', NOW() - INTERVAL '13 days'),
  ('REV-208', 'GU-NEW-013B', 'USR-002', 'USR-013', 4, 'Xử lý block kêu rất ok, máy lạnh giờ chạy êm ru.', NOW() - INTERVAL '10 days'),
  ('REV-209', 'GU-NEW-013C', 'USR-008', 'USR-013', 5, 'Bảo trì chu đáo, giải thích cặn kẽ tình trạng máy.', NOW() - INTERVAL '6 days'),
  ('REV-210', 'GU-NEW-014A', 'USR-003', 'USR-014', 5, 'Xì gas tủ lạnh xử lý triệt để, tủ lạnh mát trở lại.', NOW() - INTERVAL '14 days'),
  ('REV-211', 'GU-NEW-014B', 'USR-007', 'USR-014', 4, 'Thay block tủ lạnh, làm kỹ càng, bảo hành 12 tháng.', NOW() - INTERVAL '9 days'),
  ('REV-212', 'GU-NEW-014C', 'USR-002', 'USR-014', 5, 'Bảo dưỡng tốt, tư vấn nhiệt tình.', NOW() - INTERVAL '2 days'),
  ('REV-213', 'GU-NEW-015A', 'USR-008', 'USR-015', 5, 'Lắp bình nóng lạnh nhanh, đẹp, an toàn. Rất chuyên nghiệp.', NOW() - INTERVAL '19 days'),
  ('REV-214', 'GU-NEW-015B', 'USR-003', 'USR-015', 4, 'Thay rơ le nhiệt xong có nước nóng ngay, giá ổn.', NOW() - INTERVAL '15 days'),
  ('REV-215', 'GU-NEW-015C', 'USR-007', 'USR-015', 5, 'Lắp hệ thống NLMT cho nhà tôi, chạy rất tốt. Cảm ơn anh!', NOW() - INTERVAL '11 days'),
  ('REV-216', 'GU-NEW-016A', 'USR-002', 'USR-016', 5, 'Vệ sinh máy lạnh âm trần rất sạch, chuyên nghiệp.', NOW() - INTERVAL '9 days'),
  ('REV-217', 'GU-NEW-016B', 'USR-008', 'USR-016', 4, 'Bảo trì VRV tốn nhiều thời gian nhưng kết quả ổn.', NOW() - INTERVAL '6 days'),
  ('REV-218', 'GU-NEW-016C', 'USR-007', 'USR-016', 5, 'Sửa board mạch nhanh, máy chạy lại ngon lành.', NOW() - INTERVAL '3 days'),
  ('REV-219', 'GU-NEW-017A', 'USR-003', 'USR-017', 4, 'Sửa máy giặt Electrolux, hết lỗi E4, chạy tốt.', NOW() - INTERVAL '12 days'),
  ('REV-220', 'GU-NEW-017B', 'USR-008', 'USR-017', 5, 'Máy sấy hết kêu, thay dây curoa nhanh gọn.', NOW() - INTERVAL '8 days'),
  ('REV-221', 'GU-NEW-017C', 'USR-002', 'USR-017', 4, 'Thay bơm xả ok, giá hợp lý.', NOW() - INTERVAL '4 days'),
  ('REV-222', 'GU-NEW-018A', 'USR-007', 'USR-018', 4, 'Vệ sinh máy lạnh nhanh, giá rẻ. Phù hợp gia đình.', NOW() - INTERVAL '17 days'),
  ('REV-223', 'GU-NEW-018B', 'USR-003', 'USR-018', 5, 'Máy lạnh hết không lạnh, xử lý gọn lẹ!', NOW() - INTERVAL '13 days'),
  ('REV-224', 'GU-NEW-018C', 'USR-008', 'USR-018', 3, 'Làm được nhưng hơi lâu, thợ vui vẻ.', NOW() - INTERVAL '7 days'),
  ('REV-225', 'GU-NEW-019A', 'USR-002', 'USR-019', 5, 'Sửa tủ đông Sanaky rất tốt, hàng đông đá trở lại.', NOW() - INTERVAL '19 days'),
  ('REV-226', 'GU-NEW-019B', 'USR-007', 'USR-019', 4, 'Tủ lạnh Hitachi hết kém lạnh, cảm ơn anh!', NOW() - INTERVAL '15 days'),
  ('REV-227', 'GU-NEW-019C', 'USR-008', 'USR-019', 5, 'Bảo dưỡng tủ lạnh định kỳ, thợ thân thiện.', NOW() - INTERVAL '9 days'),
  ('REV-228', 'GU-NEW-020A', 'USR-003', 'USR-020', 5, 'Lắp bình nóng lạnh đẹp, đúng kỹ thuật. Cảm ơn!', NOW() - INTERVAL '13 days'),
  ('REV-229', 'GU-NEW-020B', 'USR-002', 'USR-020', 4, 'Thay aptomat tổng xong, điện ổn định hơn.', NOW() - INTERVAL '10 days'),
  ('REV-230', 'GU-NEW-020C', 'USR-007', 'USR-020', 5, 'Thay thanh đốt nóng nhanh, giá phải chăng.', NOW() - INTERVAL '5 days'),
  ('REV-231', 'GU-NEW-021A', 'USR-008', 'USR-021', 5, 'Vệ sinh + bơm gas, máy lạnh lạnh sâu và êm.', NOW() - INTERVAL '16 days'),
  ('REV-232', 'GU-NEW-021B', 'USR-007', 'USR-021', 4, 'Rò nước hết sau khi sửa, hài lòng.', NOW() - INTERVAL '12 days'),
  ('REV-233', 'GU-NEW-021C', 'USR-003', 'USR-021', 5, 'Dàn nóng sạch bong, máy chạy mát hơn hẳn.', NOW() - INTERVAL '8 days'),
  ('REV-234', 'GU-NEW-022A', 'USR-002', 'USR-022', 4, 'Thay dây curoa máy giặt nhanh gọn, chạy tốt.', NOW() - INTERVAL '18 days'),
  ('REV-235', 'GU-NEW-022B', 'USR-008', 'USR-022', 5, 'Máy giặt hết kêu, thay vòng bi chuyên nghiệp.', NOW() - INTERVAL '14 days'),
  ('REV-236', 'GU-NEW-022C', 'USR-007', 'USR-022', 4, 'Sửa bo mạch LG hết lỗi, chạy ổn định.', NOW() - INTERVAL '9 days'),
  ('REV-237', 'GU-NEW-023A', 'USR-003', 'USR-023', 5, 'Kiểm tra block tủ lạnh tận tình, không tính thêm phí.', NOW() - INTERVAL '21 days'),
  ('REV-238', 'GU-NEW-023B', 'USR-008', 'USR-023', 4, 'Vệ sinh tủ lạnh sạch sẽ, hết mùi.', NOW() - INTERVAL '16 days'),
  ('REV-239', 'GU-NEW-023C', 'USR-002', 'USR-023', 5, 'Đóng tuyết đã hết, tủ lạnh hoạt động tốt.', NOW() - INTERVAL '7 days'),
  ('REV-240', 'GU-NEW-024A', 'USR-007', 'USR-024', 5, 'Vệ sinh máy lạnh kỹ, kiểm tra gas đầy đủ.', NOW() - INTERVAL '15 days'),
  ('REV-241', 'GU-NEW-024B', 'USR-008', 'USR-024', 4, 'Thay tụ xong máy lạnh chạy mát trở lại.', NOW() - INTERVAL '11 days'),
  ('REV-242', 'GU-NEW-024C', 'USR-003', 'USR-024', 5, 'Block kêu to giờ không còn tiếng ồn, rất ok!', NOW() - INTERVAL '5 days'),
  ('REV-243', 'GU-NEW-025A', 'USR-002', 'USR-025', 5, 'Lắp máy nước nóng trực tiếp gọn đẹp, nước nóng ngay.', NOW() - INTERVAL '20 days'),
  ('REV-244', 'GU-NEW-025B', 'USR-007', 'USR-025', 4, 'Thông tắc bồn rửa thành công, vệ sinh sạch sẽ.', NOW() - INTERVAL '15 days'),
  ('REV-245', 'GU-NEW-025C', 'USR-008', 'USR-025', 3, 'Thay rơ le tạm ổn, giá hơi cao so với thị trường.', NOW() - INTERVAL '9 days'),
  ('REV-246', 'GU-NEW-026A', 'USR-003', 'USR-026', 5, 'Máy giặt Samsung xả nước tốt trở lại, cảm ơn thợ!', NOW() - INTERVAL '23 days'),
  ('REV-247', 'GU-NEW-026B', 'USR-008', 'USR-026', 4, 'Thay bơm xả nhanh, máy giặt chạy ngon.', NOW() - INTERVAL '17 days'),
  ('REV-248', 'GU-NEW-026C', 'USR-002', 'USR-026', 5, 'Sửa lỗi E7 Electrolux, kỹ thuật viên giỏi.', NOW() - INTERVAL '6 days'),
  ('REV-249', 'GU-NEW-027A', 'USR-007', 'USR-027', 5, 'Vệ sinh 3 dàn lạnh multi sạch sẽ, máy chạy mát.', NOW() - INTERVAL '14 days'),
  ('REV-250', 'GU-NEW-027B', 'USR-008', 'USR-027', 4, 'Sửa block máy lạnh Mitsubishi, chạy êm, giá hơi cao.', NOW() - INTERVAL '9 days'),
  ('REV-251', 'GU-NEW-027C', 'USR-003', 'USR-027', 5, 'Bảo trì máy lạnh chung cư nhanh, chuyên nghiệp.', NOW() - INTERVAL '4 days'),
  ('REV-252', 'GU-NEW-028A', 'USR-002', 'USR-028', 5, 'Sửa board tủ lạnh Samsung inverter kỹ lưỡng, có bảo hành.', NOW() - INTERVAL '19 days'),
  ('REV-253', 'GU-NEW-028B', 'USR-008', 'USR-028', 4, 'Tủ lạnh hết kém lạnh, xử lý ổn.', NOW() - INTERVAL '13 days'),
  ('REV-254', 'GU-NEW-028C', 'USR-007', 'USR-028', 5, 'Vệ sinh tủ lạnh sạch bong, giá hợp lý.', NOW() - INTERVAL '7 days'),
  ('REV-255', 'GU-NEW-029A', 'USR-003', 'USR-029', 5, 'Lắp bình Stiebel 40L đẹp, đúng kỹ thuật. Rất thích!', NOW() - INTERVAL '17 days'),
  ('REV-256', 'GU-NEW-029B', 'USR-008', 'USR-029', 4, 'Thay dây điện gia đình, an tâm hơn.', NOW() - INTERVAL '12 days'),
  ('REV-257', 'GU-NEW-029C', 'USR-007', 'USR-029', 4, 'Thay thanh đốt nóng nhanh, tạm ổn.', NOW() - INTERVAL '8 days'),
  ('REV-258', 'GU-NEW-030A', 'USR-002', 'USR-030', 5, 'Vệ sinh máy lạnh Casper sạch sẽ, máy mát lạnh.', NOW() - INTERVAL '22 days'),
  ('REV-259', 'GU-NEW-030B', 'USR-008', 'USR-030', 4, 'Bơm gas Gree đầy đủ, máy lạnh mát trở lại.', NOW() - INTERVAL '15 days'),
  ('REV-260', 'GU-NEW-030C', 'USR-007', 'USR-030', 5, 'Bảo trì định kỳ, thợ thân thiện, làm cẩn thận.', NOW() - INTERVAL '9 days')
) AS v(code, order_code, author_code, technician_code, rating, content, created_at)
CROSS JOIN LATERAL (SELECT o.id AS oid FROM orders o WHERE o.code = v.order_code) AS o
CROSS JOIN LATERAL (SELECT u.id AS auid FROM users u WHERE u.code = v.author_code) AS a
CROSS JOIN LATERAL (SELECT u.id AS tid FROM users u WHERE u.code = v.technician_code) AS t
WHERE NOT EXISTS (SELECT 1 FROM reviews r WHERE r.code = v.code);


-- 8. SYSTEM SETTINGS
INSERT INTO system_settings (setting_key, setting_value, created_at, updated_at)
VALUES
  ('fixed_commission_fee', '10000', NOW(), NOW()),
  ('minimum_commission_balance', '20000', NOW(), NOW()),
  ('auto_lock_enabled', 'true', NOW(), NOW()),
  ('refund_lock_threshold', '0', NOW(), NOW()),
  ('points_per_order', '10', NOW(), NOW()),
  ('points_rate', '0', NOW(), NOW())
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- 9. DEVICE TYPES

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-ML-TT', 'Treo tường', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-ML-TT');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-ML-AT', 'Âm tường', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-ML-AT');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-ML-INV', 'Inverter', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-ML-INV');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-ML-CS', 'Cây / tủ đứng', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-ML-CS');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-MG-CN', 'Cửa ngang', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-MG-CN');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-MG-CT', 'Cửa trên', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-MG-CT');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-MG-LG', 'Lồng đứng', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-MG-LG');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-TL-2C', 'Tủ lạnh 2 cánh', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-TL-2C');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-TL-SBS', 'Side by Side', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-TL-SBS');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-TL-MN', 'Mini / tủ lạnh nhỏ', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-TL-MN');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-MNN-TT', 'Trực tiếp (tắm)', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-004'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-MNN-TT');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-MNN-GT', 'Gián tiếp (bình chứa)', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-004'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-MNN-GT');

INSERT INTO device_types (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'DT-MNN-NLMT', 'Năng lượng mặt trời', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-004'
  AND NOT EXISTS (SELECT 1 FROM device_types WHERE code = 'DT-MNN-NLMT');

-- 10. BRANDS

-- Máy lạnh (CAT-001)
INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-ML-DAIKIN', 'Daikin', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-ML-DAIKIN');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-ML-PANA', 'Panasonic', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-ML-PANA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-ML-LG', 'LG', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-ML-LG');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-ML-TOSHIBA', 'Toshiba', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-ML-TOSHIBA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-ML-SAMSUNG', 'Samsung', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-ML-SAMSUNG');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-ML-MITSUBISHI', 'Mitsubishi Electric', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-ML-MITSUBISHI');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-ML-SHARP', 'Sharp', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-ML-SHARP');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-ML-GREE', 'Gree', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-ML-GREE');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-ML-KHAC', 'Hãng khác', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-001'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-ML-KHAC');

-- Máy giặt (CAT-002)
INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MG-LG', 'LG', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MG-LG');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MG-SAMSUNG', 'Samsung', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MG-SAMSUNG');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MG-PANA', 'Panasonic', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MG-PANA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MG-ELECTROLUX', 'Electrolux', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MG-ELECTROLUX');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MG-TOSHIBA', 'Toshiba', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MG-TOSHIBA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MG-HITACHI', 'Hitachi', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MG-HITACHI');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MG-AQUA', 'Aqua', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MG-AQUA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MG-KHAC', 'Hãng khác', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-002'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MG-KHAC');

-- Tủ lạnh (CAT-003)
INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-TL-LG', 'LG', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-TL-LG');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-TL-SAMSUNG', 'Samsung', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-TL-SAMSUNG');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-TL-PANA', 'Panasonic', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-TL-PANA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-TL-HITACHI', 'Hitachi', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-TL-HITACHI');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-TL-TOSHIBA', 'Toshiba', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-TL-TOSHIBA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-TL-AQUA', 'Aqua', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-TL-AQUA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-TL-KHAC', 'Hãng khác', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-003'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-TL-KHAC');

-- Máy nước nóng (CAT-004)
INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MNN-ARISTON', 'Ariston', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-004'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MNN-ARISTON');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MNN-FERROLI', 'Ferroli', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-004'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MNN-FERROLI');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MNN-PANA', 'Panasonic', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-004'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MNN-PANA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MNN-STIEBEL', 'Stiebel Eltron', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-004'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MNN-STIEBEL');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-MNN-KHAC', 'Hãng khác', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-004'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-MNN-KHAC');

-- Khác (CAT-005)
INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-KHAC-PANA', 'Panasonic', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-005'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-KHAC-PANA');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-KHAC-SHARP', 'Sharp', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-005'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-KHAC-SHARP');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-KHAC-SAMSUNG', 'Samsung', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-005'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-KHAC-SAMSUNG');

INSERT INTO brands (code, name, category_id, status, deleted, created_at, updated_at)
SELECT 'BR-KHAC-KHAC', 'Hãng khác', c.id, 'ACTIVE', FALSE, NOW(), NOW()
FROM categories c WHERE c.code = 'CAT-005'
  AND NOT EXISTS (SELECT 1 FROM brands WHERE code = 'BR-KHAC-KHAC');

-- BULK CUSTOMERS (46) — 4 named customers above + 46 = 50 total
INSERT INTO users (code, full_name, email, phone, password, role, status, district, address, bio, avatar, deleted, created_at, updated_at)
SELECT 'USR-C-' || LPAD(s::text,3,'0') AS code,
       'Khách mẫu ' || s AS full_name,
       'seed.cust' || s || '@glowup.demo' AS email,
       ('0933' || LPAD(s::text,4,'0')) AS phone,
       '$2a$10$F1yIORrOOEXqON1rSEC38ujw5p4fMN4UTiv9FTXJHcmvW0E.7Nns2' AS password,
       'CUSTOMER' AS role,
       'ACTIVE' AS status,
       'Thành phố Thủ Đức' AS district,
       ('Khu căn hộ mẫu số ' || s || ', TP. Thủ Đức') AS address,
       NULL AS bio,
       ('https://i.pravatar.cc/150?img=' || ((s % 70) + 10)) AS avatar,
       FALSE, NOW(), NOW()
FROM generate_series(1,46) s
ON CONFLICT (code) DO NOTHING;

-- WALLETS
-- Cột đúng theo entity Wallet; reward_points khởi tạo bằng 0 cho ví mới.
INSERT INTO wallets (
    user_id, balance, personal_balance, pending_balance, reward_points,
    total_earned, total_withdrawn, currency, version, created_at, updated_at
)
SELECT
    u.id,
    70000,  -- balance (credit)
    0,      -- personal_balance
    0,      -- pending_balance
    0,      -- reward_points
    70000,  -- total_earned
    0,      -- total_withdrawn
    'VND', 0, NOW(), NOW()
FROM users u
WHERE u.code = 'USR-004'
    ON CONFLICT (user_id) DO NOTHING;

INSERT INTO wallets (
    user_id, balance, personal_balance, pending_balance, reward_points,
    total_earned, total_withdrawn, currency, version, created_at, updated_at
)
SELECT
    u.id,
    15000,  -- balance (credit)
    0,      -- personal_balance
    0,      -- pending_balance
    0,      -- reward_points
    35000,  -- total_earned
    20000,  -- total_withdrawn
    'VND', 0, NOW(), NOW()
FROM users u
WHERE u.code = 'USR-005'
    ON CONFLICT (user_id) DO NOTHING;

INSERT INTO wallets (
    user_id, balance, personal_balance, pending_balance, reward_points,
    total_earned, total_withdrawn, currency, version, created_at, updated_at
)
SELECT
    u.id,
    0,      -- balance (credit)
    0,      -- personal_balance
    0,      -- pending_balance
    0,      -- reward_points
    15000,  -- total_earned
    15000,  -- total_withdrawn
    'VND', 0, NOW(), NOW()
FROM users u
WHERE u.code = 'USR-006'
    ON CONFLICT (user_id) DO NOTHING;

INSERT INTO wallet_transactions (
  transaction_code, wallet_id, type, wallet_type, category, title, amount, fee, net_amount,
  after_balance, note, actor, related_order_code, status, created_at, processed_at
)
SELECT 'TX-COMM-001', w.id, 'COMMISSION', 'CREDIT', 'COMMISSION_TOPUP', 'Nạp hoa hồng cho thợ',
       70000, 0, 70000, 70000,
       'Nạp quỹ hoa hồng khởi tạo', 'ADMIN', NULL,
       'SUCCESS', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
FROM wallets w
JOIN users u ON u.id = w.user_id
WHERE u.code = 'USR-004'
  AND NOT EXISTS (SELECT 1 FROM wallet_transactions wt WHERE wt.transaction_code = 'TX-COMM-001');

INSERT INTO wallet_transactions (
  transaction_code, wallet_id, type, wallet_type, category, title, amount, fee, net_amount,
  after_balance, note, actor, related_order_code, status, created_at, processed_at
)
SELECT 'TX-COMM-002', w.id, 'COMMISSION', 'CREDIT', 'COMMISSION_TOPUP', 'Nạp thêm hoa hồng cho thợ Đạt',
       35000, 0, 35000, 35000,
       'Nạp quỹ để demo trạng thái LOW_BALANCE sau khi khấu trừ', 'ADMIN', 'GU-SEED-002',
       'SUCCESS', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM wallets w
JOIN users u ON u.id = w.user_id
WHERE u.code = 'USR-005'
  AND NOT EXISTS (SELECT 1 FROM wallet_transactions wt WHERE wt.transaction_code = 'TX-COMM-002');

INSERT INTO wallet_transactions (
  transaction_code, wallet_id, type, wallet_type, category, title, amount, fee, net_amount,
  after_balance, note, actor, related_order_code, status, created_at, processed_at
)
SELECT 'TX-COMM-003', w.id, 'COMMISSION', 'CREDIT', 'COMMISSION_DEDUCTION', 'Khấu trừ hoa hồng đơn GU-88421',
       20000, 0, -20000, 15000,
       'Khấu trừ phí cố định theo đơn hoàn thành', 'SYSTEM', 'GU-88421',
       'SUCCESS', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM wallets w
JOIN users u ON u.id = w.user_id
WHERE u.code = 'USR-005'
  AND NOT EXISTS (SELECT 1 FROM wallet_transactions wt WHERE wt.transaction_code = 'TX-COMM-003');

INSERT INTO wallet_transactions (
  transaction_code, wallet_id, type, wallet_type, category, title, amount, fee, net_amount,
  after_balance, note, actor, related_order_code, status, created_at, processed_at
)
SELECT 'TX-COMM-004', w.id, 'COMMISSION', 'CREDIT', 'COMMISSION_TOPUP', 'Nạp hoa hồng khởi tạo cho thợ LOCKED demo',
       15000, 0, 15000, 15000,
       'Tạo lịch sử để kiểm thử lastOrderAt và status LOCKED', 'ADMIN', 'GU-SEED-LOCK-001',
       'SUCCESS', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'
FROM wallets w
JOIN users u ON u.id = w.user_id
WHERE u.code = 'USR-006'
  AND NOT EXISTS (SELECT 1 FROM wallet_transactions wt WHERE wt.transaction_code = 'TX-COMM-004');

INSERT INTO wallet_transactions (
  transaction_code, wallet_id, type, wallet_type, category, title, amount, fee, net_amount,
  after_balance, note, actor, related_order_code, status, created_at, processed_at
)
SELECT 'TX-COMM-005', w.id, 'COMMISSION', 'CREDIT', 'COMMISSION_DEDUCTION', 'Khấu trừ hoa hồng về 0',
       15000, 0, -15000, 0,
       'Đưa ví về trạng thái LOCKED theo balance = 0', 'SYSTEM', 'GU-SEED-LOCK-001',
       'SUCCESS', NOW() - INTERVAL '11 hours', NOW() - INTERVAL '11 hours'
FROM wallets w
JOIN users u ON u.id = w.user_id
WHERE u.code = 'USR-006'
  AND NOT EXISTS (SELECT 1 FROM wallet_transactions wt WHERE wt.transaction_code = 'TX-COMM-005');

-- Wallets for new technicians (USR-011 ~ USR-030)
INSERT INTO wallets (user_id, balance, personal_balance, pending_balance, reward_points, total_earned, total_withdrawn, currency, version, created_at, updated_at)
SELECT u.id, 50000, 0, 0, 0, 50000, 0, 'VND', 0, NOW(), NOW()
FROM users u WHERE u.code IN ('USR-011','USR-012','USR-013','USR-014','USR-015',
  'USR-016','USR-017','USR-018','USR-019','USR-020',
  'USR-021','USR-022','USR-023','USR-024','USR-025',
  'USR-026','USR-027','USR-028','USR-029','USR-030')
  AND NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = u.id);

-- Wallets for technicians without balance yet (USR-009, USR-010)
INSERT INTO wallets (user_id, balance, personal_balance, pending_balance, reward_points, total_earned, total_withdrawn, currency, version, created_at, updated_at)
SELECT u.id, 45000, 0, 0, 0, 45000, 0, 'VND', 0, NOW(), NOW()
FROM users u WHERE u.code IN ('USR-009','USR-010')
  AND NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = u.id);

-- Ensure required categories exist
INSERT INTO categories (code, title, description, icon_url, priority, status, deleted, created_at, updated_at)
VALUES
  ('CAT-SD', 'Sửa điện', 'Sửa chữa, đấu nối điện dân dụng, thay aptomat, sửa ổ cắm, bóng đèn', NULL, 'HIGH', 'ACTIVE', FALSE, NOW(), NOW()),
  ('CAT-SW', 'Sửa nước', 'Sửa ống nước, thay vòi, xử lý rò rỉ, thông tắc', NULL, 'HIGH', 'ACTIVE', FALSE, NOW(), NOW()),
  ('CAT-VML', 'Vệ sinh máy lạnh', 'Vệ sinh, bảo trì, nạp gas và kiểm tra hiệu suất máy lạnh', NULL, 'HIGH', 'ACTIVE', FALSE, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- 30 dashboard demo orders (2024-2026)
INSERT INTO orders (code, service_name, service_category, device_name, description, address, scheduled_at, started_at, completed_at, estimated_price, final_price, payment_method, warranty_months, status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-SEED-001', 'Sửa điện tại nhà', 'Sửa điện', 'Hệ thống điện gia đình', 'Sửa aptomat và ổ cắm', 'Hẻm 123, Quận 1',
       TIMESTAMP '2026-01-09 09:00:00', TIMESTAMP '2026-01-09 09:10:00', TIMESTAMP '2026-01-10 11:00:00',
       300000, 450000, 'MOMO', 0, 'COMPLETED',
       (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY random() LIMIT 1),
       (SELECT id FROM users WHERE role = 'TECHNICIAN' ORDER BY random() LIMIT 1), FALSE, TIMESTAMP '2026-01-08', TIMESTAMP '2026-01-10'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-SEED-001');

INSERT INTO orders (code, service_name, service_category, device_name, description, address, scheduled_at, started_at, completed_at, estimated_price, final_price, payment_method, warranty_months, status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-SEED-002', 'Sửa nước tại nhà', 'Sửa nước', 'Đường ống gia đình', 'Sửa rò rỉ ống nước', 'Số 5, Quận 3',
       TIMESTAMP '2026-02-19 10:00:00', TIMESTAMP '2026-02-19 10:10:00', TIMESTAMP '2026-02-20 12:30:00',
        250000, 350000, 'BANK_TRANSFER', 0, 'COMPLETED',
       (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY random() LIMIT 1),
       (SELECT id FROM users WHERE role = 'TECHNICIAN' ORDER BY random() LIMIT 1), FALSE, TIMESTAMP '2026-02-18', TIMESTAMP '2026-02-20'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-SEED-002');

-- Mar 2026
INSERT INTO orders (code, service_name, service_category, device_name, description, address, scheduled_at, started_at, completed_at, estimated_price, final_price, payment_method, warranty_months, status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-SEED-003', 'Vệ sinh máy lạnh', 'Vệ sinh máy lạnh', 'Điều hòa Panasonic', 'Vệ sinh + kiểm tra gas', 'Số 21, Quận 7',
       TIMESTAMP '2026-03-05 08:30:00', TIMESTAMP '2026-03-05 08:45:00', TIMESTAMP '2026-03-05 11:00:00',
       400000, 600000, 'MOMO', 0, 'COMPLETED',
       (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY random() LIMIT 1),
       (SELECT id FROM users WHERE role = 'TECHNICIAN' ORDER BY random() LIMIT 1), FALSE, TIMESTAMP '2026-03-04', TIMESTAMP '2026-03-05'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-SEED-003');

INSERT INTO orders (code, service_name, service_category, device_name, description, address, scheduled_at, started_at, completed_at, estimated_price, final_price, payment_method, warranty_months, status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-SEED-004', 'Vệ sinh máy lạnh - lần 2', 'Vệ sinh máy lạnh', 'Điều hòa LG', 'Vệ sinh + thay keo', 'Số 99, Quận Phú Nhuận',
       TIMESTAMP '2026-03-14 14:00:00', TIMESTAMP '2026-03-14 14:15:00', TIMESTAMP '2026-03-15 16:30:00',
        350000, 550000, 'BANK_TRANSFER', 0, 'COMPLETED',
       (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY random() LIMIT 1),
       (SELECT id FROM users WHERE role = 'TECHNICIAN' ORDER BY random() LIMIT 1), FALSE, TIMESTAMP '2026-03-13', TIMESTAMP '2026-03-15'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-SEED-004');

-- Q2 2025
INSERT INTO orders (code, service_name, service_category, device_name, description, address, scheduled_at, started_at, completed_at, estimated_price, final_price, payment_method, warranty_months, status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-SEED-005', 'Sửa điện lớn', 'Sửa điện', 'Bảng điện gia đình', 'Thay aptomat, đấu lại bóng đèn', 'Khu A, Quận 2',
       TIMESTAMP '2025-04-14 09:00:00', TIMESTAMP '2025-04-14 09:30:00', TIMESTAMP '2025-04-15 12:00:00',
       500000, 1200000, 'MOMO', 0, 'COMPLETED',
       (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY random() LIMIT 1),
       (SELECT id FROM users WHERE role = 'TECHNICIAN' ORDER BY random() LIMIT 1), FALSE, TIMESTAMP '2025-04-10', TIMESTAMP '2025-04-15'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-SEED-005');

INSERT INTO orders (code, service_name, service_category, device_name, description, address, scheduled_at, started_at, completed_at, estimated_price, final_price, payment_method, warranty_months, status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-SEED-006', 'Sửa rò rỉ nước', 'Sửa nước', 'Hệ thống ống', 'Xử lý rò rỉ, thay gioăng', 'Khu B, Quận 5',
       TIMESTAMP '2025-05-04 10:00:00', TIMESTAMP '2025-05-04 10:20:00', TIMESTAMP '2025-05-05 13:00:00',
        220000, 280000, 'BANK_TRANSFER', 0, 'COMPLETED',
       (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY random() LIMIT 1),
       (SELECT id FROM users WHERE role = 'TECHNICIAN' ORDER BY random() LIMIT 1), FALSE, TIMESTAMP '2025-05-01', TIMESTAMP '2025-05-05'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-SEED-006');

-- 2024-2025
INSERT INTO orders (code, service_name, service_category, device_name, description, address, scheduled_at, started_at, completed_at, estimated_price, final_price, payment_method, warranty_months, status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-SEED-007', 'Sửa nhỏ', 'Sửa điện', 'Thiết bị điện nhỏ', 'Sửa ổ cắm', 'Quận Tân Bình',
       TIMESTAMP '2025-03-09 08:00:00', TIMESTAMP '2025-03-09 08:15:00', TIMESTAMP '2025-03-10 09:30:00',
        200000, 300000, 'BANK_TRANSFER', 0, 'COMPLETED',
       (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY random() LIMIT 1),
       (SELECT id FROM users WHERE role = 'TECHNICIAN' ORDER BY random() LIMIT 1), FALSE, TIMESTAMP '2025-03-01', TIMESTAMP '2025-03-10'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-SEED-007');

INSERT INTO orders (code, service_name, service_category, device_name, description, address, scheduled_at, started_at, completed_at, estimated_price, final_price, payment_method, warranty_months, status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT 'GU-SEED-008', 'Vệ sinh máy lạnh cũ', 'Vệ sinh máy lạnh', 'Điều hòa cũ', 'Vệ sinh sâu, kiểm tra gas', 'Quận 4',
       TIMESTAMP '2024-07-20 09:00:00', TIMESTAMP '2024-07-20 09:20:00', TIMESTAMP '2024-07-22 11:00:00',
       300000, 450000, 'MOMO', 0, 'COMPLETED',
       (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY random() LIMIT 1),
       (SELECT id FROM users WHERE role = 'TECHNICIAN' ORDER BY random() LIMIT 1), FALSE, TIMESTAMP '2024-07-19', TIMESTAMP '2024-07-22'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE code = 'GU-SEED-008');

-- Remaining 22 generated orders
WITH seq AS (
  SELECT generate_series(1,22) AS s
), gen AS (
  SELECT
    'GU-SEED-G' || LPAD(s::text,3,'0') AS code,
    (ARRAY['Sửa điện','Sửa nước','Vệ sinh máy lạnh'])[1 + (floor(random()*3))] AS service_category,
    now() - ((random() * extract(epoch FROM (now() - timestamp '2024-01-01')) ) * interval '1 second') AS completed_at,
    s
  FROM seq
)
INSERT INTO orders (code, service_name, service_category, device_name, description, address, scheduled_at, started_at, completed_at, estimated_price, final_price, payment_method, warranty_months, status, customer_id, technician_id, deleted, created_at, updated_at)
SELECT g.code,
       g.service_category || ' (dịch vụ thử nghiệm) ',
       g.service_category,
       'Thiết bị mẫu',
       'Mô tả demo cho đơn',
       'Địa chỉ demo ' || g.s,
       CASE WHEN g.s <= 10 THEN g.completed_at - interval '1 day' ELSE g.completed_at - interval '2 hours' END AS scheduled_at,
       CASE WHEN g.s <= 10 THEN g.completed_at - interval '23 hours' ELSE g.completed_at - interval '1 hour' END AS started_at,
       g.completed_at,
       (floor(random() * (2000000 - 200000) + 200000))::bigint AS estimated_price,
       (floor(random() * (2000000 - 200000) + 200000))::bigint AS final_price,
        CASE WHEN random() < 0.5 THEN 'MOMO' ELSE 'BANK_TRANSFER' END,
       0,
       'COMPLETED',
       (SELECT id FROM users WHERE role = 'CUSTOMER' ORDER BY random() LIMIT 1),
       (SELECT id FROM users WHERE role = 'TECHNICIAN' ORDER BY random() LIMIT 1),
       FALSE,
       g.completed_at - interval '1 day',
       g.completed_at
FROM gen g
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.code = g.code);

-- ORDER REPORTS (10)
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-001', o.id, o.customer_id, o.technician_id, 'BAD_ATTITUDE',
       'KTV đến trễ 30p, nói chuyện cộc lốc, không giải thích chi phí phát sinh.',
       'RESOLVED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'
FROM orders o WHERE o.code = 'GU-SEED-001'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-001');

-- order 002
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-002', o.id, o.customer_id, o.technician_id, 'OTHER',
       'KTV tự ý sửa thêm hạng mục không được yêu cầu, làm tăng thời gian và chi phí.',
       'INVESTIGATING', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
FROM orders o WHERE o.code = 'GU-SEED-002'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-002');

-- order 003
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-003', o.id, o.customer_id, o.technician_id, 'NO_SHOW',
       'KTV không đến đúng giờ hẹn, không báo trước, tôi chờ 1 tiếng.',
       'OPEN', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
FROM orders o WHERE o.code = 'GU-SEED-003'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-003');

-- order 004
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-004', o.id, o.customer_id, o.technician_id, 'FRAUD',
       'KTV báo chi phí thay thế linh kiện cao gấp 3 lần giá thị trường, có dấu hiệu gian lận.',
       'DISMISSED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'
FROM orders o WHERE o.code = 'GU-SEED-004'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-004');

-- order 005
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-005', o.id, o.customer_id, o.technician_id, 'EXTRA_FEE',
       'Báo giá 500k, sau đó KTV đòi thêm 700k vì "dây cũ", tôi không đồng ý.',
       'RESOLVED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days'
FROM orders o WHERE o.code = 'GU-SEED-005'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-005');

-- order 006
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-006', o.id, o.customer_id, o.technician_id, 'POOR_QUALITY',
       'Sửa xong 2 ngày lại hỏng, KTV không bảo hành, đòi thu thêm tiền.',
       'INVESTIGATING', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
FROM orders o WHERE o.code = 'GU-SEED-006'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-006');

-- order 007
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-007', o.id, o.customer_id, o.technician_id, 'EXTRA_FEE',
       'KTV báo thêm phí vệ sinh nhưng đã bao gồm trong gói dịch vụ.',
       'OPEN', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM orders o WHERE o.code = 'GU-SEED-007'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-007');

-- order 008
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-008', o.id, o.customer_id, o.technician_id, 'NO_SHOW',
       'KTV hẹn 9h sáng nhưng 11h mới đến, không báo trước.',
       'DISMISSED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days'
FROM orders o WHERE o.code = 'GU-SEED-008'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-008');

-- order 001 (second report)
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-009', o.id, o.customer_id, o.technician_id, 'FRAUD',
       'KTV thay aptomat mới nhưng thực tế chỉ sửa lại cái cũ, có dấu hiệu lừa đảo.',
       'INVESTIGATING', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
FROM orders o WHERE o.code = 'GU-SEED-001'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-009');

-- order 003 (second report)
INSERT INTO order_reports (code, order_id, customer_id, technician_id, reason, description, status, created_at, updated_at)
SELECT 'REP-010', o.id, o.customer_id, o.technician_id, 'POOR_QUALITY',
       'Vệ sinh máy lạnh xong vẫn bốc mùi, KTV không xử lý triệt để.',
       'RESOLVED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'
FROM orders o WHERE o.code = 'GU-SEED-003'
                AND NOT EXISTS (SELECT 1 FROM order_reports WHERE code = 'REP-010');
