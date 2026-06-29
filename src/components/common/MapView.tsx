import React from 'react';

const HCMC_LAT = 10.8231;
const HCMC_LNG = 106.6297;

interface MapViewProps {
  lat?: number;
  lng?: number;
  address?: string;
  height?: number | string;
  zoom?: number;
  style?: React.CSSProperties;
}

function encodeQuery(value: string): string {
  return encodeURIComponent(value);
}

const MapView: React.FC<MapViewProps> = ({
  lat,
  lng,
  address,
  height = 200,
  style,
}) => {
  const h = typeof height === 'number' ? height : parseInt(height, 10) || 200;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: h,
    borderRadius: '12px',
    overflow: 'hidden',
    ...style,
  };

  let src: string;

  if (lat && lng) {
    const margin = 0.015;
    const bbox = `${lng - margin},${lat - margin},${lng + margin},${lat + margin}`;
    src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeQuery(bbox)}&layer=mapnik&marker=${encodeQuery(`${lat},${lng}`)}`;
  } else if (address) {
    const query = encodeQuery(address);
    src = `https://www.openstreetmap.org/export/embed.html?query=${query}&layer=mapnik`;
  } else {
    const margin = 0.05;
    const bbox = `${HCMC_LNG - margin},${HCMC_LAT - margin},${HCMC_LNG + margin},${HCMC_LAT + margin}`;
    src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeQuery(bbox)}&layer=mapnik`;
  }

  return (
    <div style={containerStyle}>
      <iframe
        title="Bản đồ"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        src={src}
        style={{ border: 'none', borderRadius: '12px' }}
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default MapView;
