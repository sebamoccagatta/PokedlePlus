import React from "react";

export const PokeballIcon = ({ colorTop = "#ef4444", colorBottom = "#ffffff", stripes = null, className = "h-8 w-8" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    {/* Fondo/Borde */}
    <circle cx="50" cy="50" r="48" fill="#1f2937" />
    
    {/* Mitad Superior */}
    <path d="M50 2A48 48 0 0 1 98 50H2A48 48 0 0 1 50 2Z" fill={colorTop} />
    
    {/* Detalles/Rayas superiores según el tipo */}
    {stripes}

    {/* Mitad Inferior */}
    <path d="M50 98A48 48 0 0 1 2 50H98A48 48 0 0 1 50 98Z" fill={colorBottom} />
    
    {/* Banda Central */}
    <rect x="2" y="46" width="96" height="8" fill="#1f2937" />
    
    {/* Botón Central */}
    <circle cx="50" cy="50" r="18" fill="#1f2937" />
    <circle cx="50" cy="50" r="12" fill="white" />
    <circle cx="50" cy="50" r="8" fill="none" stroke="#e5e7eb" strokeWidth="1" />
  </svg>
);

export const ClassicBall = (props) => (
  <PokeballIcon 
    {...props} 
    colorTop="#a855f7" 
    stripes={
      <g>
        <circle cx="30" cy="30" r="12" fill="#ec4899" opacity="0.6" />
        <circle cx="70" cy="30" r="12" fill="#ec4899" opacity="0.6" />
        <text x="50" y="38" fontSize="24" fontWeight="900" textAnchor="middle" fill="white" style={{fontFamily: 'sans-serif'}}>M</text>
      </g>
    } 
  />
);

export const Pokeball = (props) => <PokeballIcon {...props} colorTop="#ef4444" />;
export const Greatball = (props) => (
  <PokeballIcon 
    {...props} 
    colorTop="#3b82f6" 
    stripes={
      <g>
        <rect x="20" y="10" width="10" height="30" fill="#ef4444" transform="rotate(-20 20 10)" />
        <rect x="70" y="10" width="10" height="30" fill="#ef4444" transform="rotate(20 70 10)" />
      </g>
    }
  />
);
export const Ultraball = (props) => (
  <PokeballIcon 
    {...props} 
    colorTop="#374151" 
    stripes={
      <g>
        <path d="M20 10 Q 50 40 80 10" stroke="#facc15" strokeWidth="8" fill="none" />
        <rect x="45" y="5" width="10" height="35" fill="#facc15" />
      </g>
    }
  />
);
export const Luxuryball = (props) => (
  <PokeballIcon 
    {...props} 
    colorTop="#111827" 
    colorBottom="#374151"
    stripes={
      <g>
        <circle cx="50" cy="25" r="15" fill="none" stroke="#facc15" strokeWidth="4" />
        <rect x="10" y="40" width="80" height="4" fill="#ef4444" />
      </g>
    }
  />
);
export const Premierball = (props) => (
  <PokeballIcon 
    {...props} 
    colorTop="#ffffff" 
    stripes={<circle cx="50" cy="50" r="48" fill="none" stroke="#ef4444" strokeWidth="2" />}
  />
);
export const Healball = (props) => (
  <PokeballIcon 
    {...props} 
    colorTop="#f472b6" 
    colorBottom="#fbcfe8"
    stripes={
      <g>
        <circle cx="50" cy="25" r="10" fill="#60a5fa" />
        <path d="M10 30 Q 50 10 90 30" stroke="white" strokeWidth="4" fill="none" />
      </g>
    }
  />
);
export const Nestball = (props) => (
  <PokeballIcon 
    {...props} 
    colorTop="#4ade80" 
    stripes={
      <g>
        <circle cx="50" cy="25" r="20" fill="none" stroke="#84cc16" strokeWidth="6" />
        <circle cx="50" cy="25" r="10" fill="none" stroke="#84cc16" strokeWidth="3" />
      </g>
    }
  />
);
export const Netball = (props) => (
  <PokeballIcon 
    {...props} 
    colorTop="#2563eb" 
    stripes={
      <g>
        <path d="M10 10 L 90 46 M 90 10 L 10 46 M 50 2 L 50 46" stroke="#111827" strokeWidth="2" />
        <circle cx="50" cy="25" r="15" fill="none" stroke="#111827" strokeWidth="1" />
      </g>
    }
  />
);
export const Quickball = (props) => (
  <PokeballIcon 
    {...props} 
    colorTop="#1d4ed8" 
    stripes={
      <g>
        <path d="M50 5 L 60 45 L 50 35 L 40 45 Z" fill="#facc15" />
        <path d="M5 25 L 45 35 L 35 25 L 45 15 Z" fill="#facc15" />
        <path d="M95 25 L 55 35 L 65 25 L 55 15 Z" fill="#facc15" />
      </g>
    }
  />
);
