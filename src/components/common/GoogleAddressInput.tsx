import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

export interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  district?: string;
  city?: string;
}

interface GoogleAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceChanged?: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface NominatimSuggestion {
  address: string;
  lat: number;
  lng: number;
  shortName: string;
}

const HCMC_VIEWBOX = '106.36,10.58,106.98,11.10';
const HCMC_BOUNDS = {
  sw: { lat: 10.58, lng: 106.36 },
  ne: { lat: 11.10, lng: 106.98 },
};

const OUTSIDE_HCMC = [
  'Bình Dương', 'Đồng Nai', 'Long An', 'Tây Ninh',
  'Bà Rịa', 'Vũng Tàu', 'Tiền Giang',
];

function isInHCMC(item: any): boolean {
  const state: string = item.address?.state || '';
  const display: string = item.display_name || '';

  if (state && state.includes('Hồ Chí Minh')) return true;

  if (!display.includes('Hồ Chí Minh')) return false;
  return !OUTSIDE_HCMC.some(p => display.includes(p));
}

function shortenAddress(full: string): string {
  const parts = full.split(',').map(p => p.trim());
  if (parts.length <= 2) return full;
  const relevant = parts.slice(0, -1).slice(0, -1);
  const city = parts.slice(-2, -1)[0] || '';
  return [...relevant, city].join(', ');
}

async function geocodeAddress(
  q: string,
  signal?: AbortSignal
): Promise<{ lat: number; lng: number; address: string } | null> {
  try {
    const searchQ = q.toLowerCase().includes('hồ chí minh') || q.toLowerCase().includes('saigon') || q.toLowerCase().includes('sg')
      ? q
      : `${q}, Thành phố Hồ Chí Minh`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQ)}&format=json&limit=5&bounded=1&viewbox=${HCMC_VIEWBOX}&addressdetails=1&accept-language=vi`,
      { headers: { 'User-Agent': 'ThuongMaiDienTu/1.0' }, signal }
    );
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    for (const item of data) {
      if (isInHCMC(item)) {
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.display_name,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchNominatimSuggestions(
  query: string,
  signal: AbortSignal
): Promise<NominatimSuggestion[]> {
  try {
    const searchQ = query.toLowerCase().includes('hồ chí minh') || query.toLowerCase().includes('saigon')
      ? query
      : `${query}, Thành phố Hồ Chí Minh`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQ)}&format=json&limit=7&bounded=1&viewbox=${HCMC_VIEWBOX}&addressdetails=1&accept-language=vi`,
      { headers: { 'User-Agent': 'ThuongMaiDienTu/1.0' }, signal }
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter(isInHCMC)
      .map((item: any) => ({
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        shortName: shortenAddress(item.display_name),
      }));
  } catch {
    return [];
  }
}

const GoogleAddressInput: React.FC<GoogleAddressInputProps> = ({
  value,
  onChange,
  onPlaceChanged,
  placeholder = 'Nhập địa chỉ...',
  className = '',
  disabled = false,
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [geocoding, setGeocoding] = useState(false);
  const searchTimer = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [useNominatim, setUseNominatim] = useState(false);

  useEffect(() => {
    if (loadError) {
      setUseNominatim(true);
    } else if (!isLoaded) {
      setUseNominatim(true);
    } else {
      setUseNominatim(false);
    }
  }, [isLoaded, loadError]);

  useEffect(() => {
    if (!isLoaded || loadError || !inputRef.current || autocompleteRef.current) return;

    try {
      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['address_components', 'geometry', 'formatted_address', 'name'],
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(HCMC_BOUNDS.sw.lat, HCMC_BOUNDS.sw.lng),
          new google.maps.LatLng(HCMC_BOUNDS.ne.lat, HCMC_BOUNDS.ne.lng)
        ),
        componentRestrictions: { country: 'VN' },
      });

      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (!place || !place.geometry || !place.geometry.location) return;

        const addr = place.formatted_address || place.name || '';
        onChange(addr);

        if (onPlaceChanged) {
          let district = '';
          let city = '';
          for (const comp of place.address_components || []) {
            if (comp.types.includes('administrative_area_level_2')) {
              district = comp.long_name;
            }
            if (comp.types.includes('administrative_area_level_1')) {
              city = comp.long_name;
            }
          }

          onPlaceChanged({
            address: addr,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            district,
            city,
          });
        }
      });

      autocompleteRef.current = ac;
    } catch {
      setUseNominatim(true);
    }
  }, [isLoaded, loadError, onChange, onPlaceChanged]);

  const triggerGeocode = useCallback(async (q: string) => {
    if (!onPlaceChanged || !q.trim()) return;
    setGeocoding(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const result = await geocodeAddress(q.trim(), controller.signal);
    if (result && onPlaceChanged) {
      onPlaceChanged({ address: result.address, lat: result.lat, lng: result.lng });
    }
    setGeocoding(false);
  }, [onPlaceChanged]);

  const handleNominatimSearch = useCallback((query: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (abortRef.current && !geocoding) abortRef.current.abort();

    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimer.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      const results = await fetchNominatimSuggestions(query, controller.signal);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setHighlightedIndex(-1);
    }, 300);
  }, [geocoding]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (useNominatim) {
      handleNominatimSearch(val);
    }
    setHighlightedIndex(-1);
  }, [onChange, useNominatim, handleNominatimSearch]);

  const selectSuggestion = useCallback((s: NominatimSuggestion) => {
    onChange(s.address);
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
    if (onPlaceChanged) {
      onPlaceChanged({ address: s.address, lat: s.lat, lng: s.lng });
    }
  }, [onChange, onPlaceChanged]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (useNominatim && showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[highlightedIndex]);
        return;
      }
    }

    if (e.key === 'Enter' && !e.defaultPrevented) {
      e.preventDefault();
      triggerGeocode(value);
    }
  }, [useNominatim, showSuggestions, suggestions, highlightedIndex, selectSuggestion, triggerGeocode, value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const inputEl = (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {inputEl}
      {useNominatim && showSuggestions && suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 2000,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            listStyle: 'none',
            padding: '4px 0',
            margin: '2px 0 0 0',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => selectSuggestion(s)}
              onMouseEnter={() => setHighlightedIndex(i)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 13,
                lineHeight: 1.4,
                color: '#1e293b',
                background: highlightedIndex === i ? '#eef2ff' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ fontWeight: 500 }}>{s.shortName}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {s.address.length > 60 ? s.address.slice(0, 60) + '...' : s.address}
              </div>
            </li>
          ))}
        </ul>
      )}
      {geocoding && (
        <span style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap',
        }}>
          Đang tìm...
        </span>
      )}
    </div>
  );
};

export default GoogleAddressInput;
