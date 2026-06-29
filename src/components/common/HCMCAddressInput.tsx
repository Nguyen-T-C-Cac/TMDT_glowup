import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HCMC_DISTRICTS } from '../../data';

export interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  district?: string;
  ward?: string;
}

interface HCMCAddressInputProps {
  onChange?: (value: string) => void;
  onPlaceChanged?: (place: PlaceResult) => void;
  initialDistrict?: string;
  initialWard?: string;
  initialStreet?: string;
}

async function geocodeFullAddress(
  street: string,
  ward: string,
  district: string
): Promise<{ lat: number; lng: number; display: string } | null> {
  const fullQ = `${street}, ${ward}, ${district}, Thành phố Hồ Chí Minh`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQ)}&format=json&limit=3&bounded=1&viewbox=106.36,10.58,106.98,11.10&addressdetails=1&accept-language=vi`,
      { headers: { 'User-Agent': 'ThuongMaiDienTu/1.0' } }
    );
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    for (const item of data) {
      const state: string = item.address?.state || '';
      const display: string = item.display_name || '';
      if (state && state.includes('Hồ Chí Minh')) {
        return { lat: parseFloat(item.lat), lng: parseFloat(item.lon), display };
      }
      if (display.includes('Hồ Chí Minh') &&
          !['Bình Dương', 'Đồng Nai', 'Long An', 'Tây Ninh', 'Bà Rịa', 'Vũng Tàu', 'Tiền Giang']
            .some(p => display.includes(p))) {
        return { lat: parseFloat(item.lat), lng: parseFloat(item.lon), display };
      }
    }
    return null;
  } catch {
    return null;
  }
}

const HCMCAddressInput: React.FC<HCMCAddressInputProps> = ({
  onChange,
  onPlaceChanged,
  initialDistrict,
  initialWard,
  initialStreet,
}) => {
  const [district, setDistrict] = useState(initialDistrict || '');
  const [ward, setWard] = useState(initialWard || '');
  const [street, setStreet] = useState(initialStreet || '');
  const [geocoding, setGeocoding] = useState(false);
  const timerRef = useRef<number | null>(null);

  const streetRef = useRef(street);
  streetRef.current = street;
  const wardRef = useRef(ward);
  wardRef.current = ward;
  const districtRef = useRef(district);
  districtRef.current = district;

  const wards = district ? HCMC_DISTRICTS.find(d => d.name === district)?.wards || [] : [];

  const fullAddress = [street, ward, district].filter(Boolean).join(', ');

  useEffect(() => {
    if (initialDistrict) setDistrict(initialDistrict);
    if (initialWard) setWard(initialWard);
    if (initialStreet) setStreet(initialStreet);
  }, [initialDistrict, initialWard, initialStreet]);

  useEffect(() => {
    if (onChange && fullAddress) onChange(fullAddress);
  }, [fullAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerGeocode = useCallback(async () => {
    const curDistrict = districtRef.current;
    const curWard = wardRef.current;
    const curStreet = streetRef.current.trim();
    if (!curDistrict || !curWard || !curStreet || !onPlaceChanged) return;
    setGeocoding(true);
    const result = await geocodeFullAddress(curStreet, curWard, curDistrict);
    if (result) {
      onPlaceChanged({ address: result.display, lat: result.lat, lng: result.lng, district: curDistrict, ward: curWard });
    }
    setGeocoding(false);
  }, [onPlaceChanged]);

  const schedule = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!districtRef.current || !wardRef.current || !streetRef.current.trim()) return;
    timerRef.current = window.setTimeout(triggerGeocode, 700);
  }, [triggerGeocode]);

  useEffect(() => {
    schedule();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [district, ward]);

  useEffect(() => {
    if (street.length >= 3) schedule();
  }, [street]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 8,
          border: '1px solid #e2e8f0', background: '#f8fafc',
          fontSize: 13, color: '#64748b',
        }}
      >
        <span style={{ fontWeight: 600, color: '#334155' }}>TP. Hồ Chí Minh</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>(mặc định)</span>
      </div>

      <div className="address-row" style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <select
          value={district}
          onChange={(e) => { setDistrict(e.target.value); setWard(''); }}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8,
            border: '1px solid #e2e8f0', fontSize: 13,
            color: district ? '#1e293b' : '#94a3b8',
            background: '#fff', cursor: 'pointer',
            outline: 'none', minWidth: 0,
          }}
        >
          <option value="">Quận / Huyện</option>
          {HCMC_DISTRICTS.map((d) => (
            <option key={d.name} value={d.name}>{d.name}</option>
          ))}
        </select>

        <select
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          disabled={!district}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8,
            border: '1px solid #e2e8f0', fontSize: 13,
            color: ward ? '#1e293b' : '#94a3b8',
            background: district ? '#fff' : '#f1f5f9',
            cursor: district ? 'pointer' : 'not-allowed',
            outline: 'none', minWidth: 0,
          }}
        >
          <option value="">Phường / Xã</option>
          {wards.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Số nhà, tên đường..."
          disabled={!ward}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: '1px solid #e2e8f0', fontSize: 13,
            color: '#1e293b', outline: 'none',
            background: ward ? '#fff' : '#f1f5f9',
            boxSizing: 'border-box',
          }}
        />
        {geocoding && (
          <span style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 11, color: '#94a3b8',
          }}>
            Đang tìm...
          </span>
        )}
      </div>

      {geocoding ? (
        <div
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#e2e8f0', color: '#94a3b8',
            fontSize: 13, fontWeight: 600, textAlign: 'center',
          }}
        >
          Đang tìm vị trí trên bản đồ...
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerGeocode}
          disabled={!district || !ward || !street.trim() || geocoding}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: district && ward && street.trim() ? '#6366f1' : '#e2e8f0',
            color: district && ward && street.trim() ? '#fff' : '#94a3b8',
            fontSize: 13, fontWeight: 600,
            cursor: district && ward && street.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
        >
          Xác nhận địa chỉ
        </button>
      )}
    </div>
  );
};

export default HCMCAddressInput;
