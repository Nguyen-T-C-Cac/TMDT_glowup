export const VIETNAM_PROVINCES = [
  { code: 'SG', name: 'Thành phố Hồ Chí Minh' },
] as const;

export interface HCMCDistrict {
  name: string;
  wards: string[];
}

export const HCMC_DISTRICTS: HCMCDistrict[] = [
  {
    name: 'Quận 1',
    wards: [
      'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cô Giang',
      'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Đa Kao',
      'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình',
      'Phường Phạm Ngũ Lão', 'Phường Tân Định',
    ],
  },
  {
    name: 'Quận 3',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
      'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
      'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14',
    ],
  },
  {
    name: 'Quận 4',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4',
      'Phường 5', 'Phường 6', 'Phường 8', 'Phường 9',
      'Phường 10', 'Phường 12', 'Phường 13', 'Phường 14',
      'Phường 15', 'Phường 16', 'Phường 18',
    ],
  },
  {
    name: 'Quận 5',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
      'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
      'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15',
    ],
  },
  {
    name: 'Quận 6',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
      'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
      'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14',
    ],
  },
  {
    name: 'Quận 7',
    wards: [
      'Phường Bình Thuận', 'Phường Phú Mỹ', 'Phường Phú Thuận',
      'Phường Tân Hưng', 'Phường Tân Kiểng', 'Phường Tân Phong',
      'Phường Tân Phú', 'Phường Tân Quy', 'Phường Tân Thuận Đông',
      'Phường Tân Thuận Tây',
    ],
  },
  {
    name: 'Quận 8',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
      'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
      'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15',
      'Phường 16',
    ],
  },
  {
    name: 'Quận 10',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 4', 'Phường 5',
      'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9',
      'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13',
      'Phường 14', 'Phường 15',
    ],
  },
  {
    name: 'Quận 11',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
      'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
      'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15',
      'Phường 16',
    ],
  },
  {
    name: 'Quận 12',
    wards: [
      'Phường An Phú Đông', 'Phường Đông Hưng Thuận',
      'Phường Hiệp Thành', 'Phường Tân Chánh Hiệp',
      'Phường Tân Hưng Thuận', 'Phường Tân Thới Hiệp',
      'Phường Tân Thới Nhất', 'Phường Thạnh Lộc',
      'Phường Thạnh Xuân', 'Phường Thới An', 'Phường Trung Mỹ Tây',
    ],
  },
  {
    name: 'Quận Bình Tân',
    wards: [
      'Phường An Lạc', 'Phường An Lạc A', 'Phường Bình Hưng Hòa',
      'Phường Bình Hưng Hòa A', 'Phường Bình Hưng Hòa B',
      'Phường Bình Trị Đông', 'Phường Bình Trị Đông A',
      'Phường Bình Trị Đông B', 'Phường Tân Tạo',
      'Phường Tân Tạo A',
    ],
  },
  {
    name: 'Quận Bình Thạnh',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6',
      'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13',
      'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19',
      'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25',
      'Phường 26', 'Phường 27', 'Phường 28',
    ],
  },
  {
    name: 'Quận Gò Vấp',
    wards: [
      'Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6',
      'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
      'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14',
      'Phường 15', 'Phường 16', 'Phường 17',
    ],
  },
  {
    name: 'Quận Phú Nhuận',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4',
      'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9',
      'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13',
      'Phường 14', 'Phường 15', 'Phường 17',
    ],
  },
  {
    name: 'Quận Tân Bình',
    wards: [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4',
      'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8',
      'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12',
      'Phường 13', 'Phường 14', 'Phường 15',
    ],
  },
  {
    name: 'Quận Tân Phú',
    wards: [
      'Phường Hiệp Tân', 'Phường Hòa Thạnh', 'Phường Phú Thạnh',
      'Phường Phú Thọ Hòa', 'Phường Phú Trung',
      'Phường Sơn Kỳ', 'Phường Tân Quý', 'Phường Tân Sơn Nhì',
      'Phường Tân Thành', 'Phường Tân Thới Hòa', 'Phường Tây Thạnh',
    ],
  },
  {
    name: 'Thành phố Thủ Đức',
    wards: [
      'Phường An Khánh', 'Phường An Lợi Đông', 'Phường An Phú',
      'Phường Bình Chiểu', 'Phường Bình Thọ', 'Phường Bình Trưng Đông',
      'Phường Bình Trưng Tây', 'Phường Cát Lái', 'Phường Hiệp Bình Chánh',
      'Phường Hiệp Bình Phước', 'Phường Hiệp Phú',
      'Phường Linh Chiểu', 'Phường Linh Đông', 'Phường Linh Tây',
      'Phường Linh Trung', 'Phường Linh Xuân',
      'Phường Long Bình', 'Phường Long Phước', 'Phường Long Thạnh Mỹ',
      'Phường Long Trường', 'Phường Phú Hữu', 'Phường Phước Bình',
      'Phường Phước Long A', 'Phường Phước Long B', 'Phường Tam Bình',
      'Phường Tam Phú', 'Phường Tân Phú', 'Phường Tăng Nhơn Phú A',
      'Phường Tăng Nhơn Phú B', 'Phường Thạnh Mỹ Lợi',
      'Phường Trường Thạnh', 'Phường Trường Thọ',
    ],
  },
  {
    name: 'Huyện Bình Chánh',
    wards: [
      'Xã An Phú Tây', 'Xã Bình Chánh', 'Xã Bình Hưng',
      'Xã Bình Lợi', 'Xã Đa Phước', 'Xã Hưng Long',
      'Xã Lê Minh Xuân', 'Xã Phạm Văn Hai', 'Xã Phong Phú',
      'Xã Quy Đức', 'Xã Tân Kiên', 'Xã Tân Nhựt', 'Xã Tân Quý Tây',
      'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B',
      'Thị trấn Tân Túc',
    ],
  },
  {
    name: 'Huyện Cần Giờ',
    wards: [
      'Xã An Thới Đông', 'Xã Bình Khánh', 'Xã Long Hòa',
      'Xã Lý Nhơn', 'Xã Tam Thôn Hiệp', 'Xã Thạnh An',
      'Thị trấn Cần Thạnh',
    ],
  },
  {
    name: 'Huyện Củ Chi',
    wards: [
      'Xã An Nhơn Tây', 'Xã An Phú', 'Xã Bình Mỹ',
      'Xã Hòa Phú', 'Xã Nhuận Đức', 'Xã Phạm Văn Cội',
      'Xã Phú Hòa Đông', 'Xã Phú Mỹ Hưng', 'Xã Phước Hiệp',
      'Xã Phước Thạnh', 'Xã Phước Vĩnh An', 'Xã Tân An Hội',
      'Xã Tân Phú Trung', 'Xã Tân Thạnh Đông', 'Xã Tân Thạnh Tây',
      'Xã Tân Thông Hội', 'Xã Thái Mỹ', 'Xã Trung An',
      'Xã Trung Lập Hạ', 'Xã Trung Lập Thượng',
      'Thị trấn Củ Chi',
    ],
  },
  {
    name: 'Huyện Hóc Môn',
    wards: [
      'Xã Bà Điểm', 'Xã Đông Thạnh', 'Xã Nhị Bình',
      'Xã Tân Hiệp', 'Xã Tân Thới Nhì', 'Xã Tân Xuân',
      'Xã Thới Tam Thôn', 'Xã Trung Chánh', 'Xã Xuân Thới Đông',
      'Xã Xuân Thới Sơn', 'Xã Xuân Thới Thượng',
      'Thị trấn Hóc Môn',
    ],
  },
  {
    name: 'Huyện Nhà Bè',
    wards: [
      'Xã Hiệp Phước', 'Xã Long Thới', 'Xã Nhơn Đức',
      'Xã Phú Xuân', 'Xã Phước Kiển', 'Xã Phước Lộc',
      'Thị trấn Nhà Bè',
    ],
  },
];
