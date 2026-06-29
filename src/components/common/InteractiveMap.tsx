import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const HCMC_LAT = 10.8231;
const HCMC_LNG = 106.6297;

interface InteractiveMapProps {
  lat?: number;
  lng?: number;
  address?: string;
  height?: number;
  suggestedAddress?: string;
  onLocationSelect?: (data: { lat: number; lng: number; address: string }) => void;
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

async function reverseGeocode(qlat: number, qlng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${qlat}&lon=${qlng}&format=json&addressdetails=1&accept-language=vi`,
      { headers: { 'User-Agent': 'ThuongMaiDienTu/1.0' } }
    );
    const data = await res.json();
    return data.display_name || `${qlat}, ${qlng}`;
  } catch {
    return `${qlat}, ${qlng}`;
  }
}

async function geocodeAddress(q: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=vi`,
      { headers: { 'User-Agent': 'ThuongMaiDienTu/1.0' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  lat,
  lng,
  height = 200,
  suggestedAddress,
  onLocationSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [internalLat, setInternalLat] = useState<number | undefined>(lat);
  const [internalLng, setInternalLng] = useState<number | undefined>(lng);
  const [geocoding, setGeocoding] = useState(false);
  const initDone = useRef(false);

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      setInternalLat(lat);
      setInternalLng(lng);
    }
  }, [lat, lng]);

  const upsertMarker = useCallback((map: L.Map, mlat: number, mlng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([mlat, mlng]);
    } else {
      const marker = L.marker([mlat, mlng], { icon: defaultIcon, draggable: true }).addTo(map);
      markerRef.current = marker;
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setInternalLat(pos.lat);
        setInternalLng(pos.lng);
        handleLocationSelect(pos.lat, pos.lng);
      });
    }
  }, []);

  const handleLocationSelect = useCallback(async (selectLat: number, selectLng: number) => {
    if (!onLocationSelect) return;
    setGeocoding(true);
    const addr = await reverseGeocode(selectLat, selectLng);
    setGeocoding(false);
    onLocationSelect({ lat: selectLat, lng: selectLng, address: addr });
  }, [onLocationSelect]);

  const centerAndPlaceMarker = useCallback((map: L.Map, mlat: number, mlng: number) => {
    map.setView([mlat, mlng], 13);
    upsertMarker(map, mlat, mlng);
  }, [upsertMarker]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    initDone.current = false;

    const initialLat = internalLat ?? HCMC_LAT;
    const initialLng = internalLng ?? HCMC_LNG;

    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (internalLat && internalLng) {
      centerAndPlaceMarker(map, internalLat, internalLng);
    } else if (suggestedAddress) {
      geocodeAddress(suggestedAddress).then((coord) => {
        if (coord && mapInstance.current) {
          centerAndPlaceMarker(map, coord.lat, coord.lng);
          setInternalLat(coord.lat);
          setInternalLng(coord.lng);
          handleLocationSelect(coord.lat, coord.lng);
        }
      });
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      setInternalLat(clickLat);
      setInternalLng(clickLng);
      centerAndPlaceMarker(map, clickLat, clickLng);
      handleLocationSelect(clickLat, clickLng);
    });

    mapInstance.current = map;
    initDone.current = true;

    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
      initDone.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !initDone.current) return;
    if (internalLat && internalLng) {
      centerAndPlaceMarker(mapInstance.current, internalLat, internalLng);
    }
  }, [internalLat, internalLng, centerAndPlaceMarker]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '12px' }} />
      {geocoding && (
        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'white', padding: '4px 12px', borderRadius: 8, fontSize: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 1000,
          color: '#64748b',
        }}>
          Đang lấy địa chỉ...
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
