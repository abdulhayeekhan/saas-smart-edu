import React, { useEffect, useState } from "react";
import "./PakistanIndependence.css";

export const PakistaniFlagSVG = ({
  width = 48,
  height = 32,
  className = "",
}: {
  width?: number;
  height?: number;
  className?: string;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 900 600"
    xmlns="http://www.w3.org/2000/svg"
    className={`moving-pakistan-flag ${className}`}
    style={{
      borderRadius: "4px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
      flexShrink: 0,
    }}
  >
    <defs>
      <linearGradient id="flagWaveShade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
        <stop offset="25%" stopColor="#000000" stopOpacity="0.25" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
        <stop offset="75%" stopColor="#000000" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    {/* Green field */}
    <rect width="900" height="600" fill="#01411C" />
    {/* White vertical bar */}
    <rect width="225" height="600" fill="#FFFFFF" />
    {/* Crescent */}
    <circle cx="562.5" cy="300" r="180" fill="#FFFFFF" />
    <circle cx="612" cy="262" r="162" fill="#01411C" />
    {/* Star pointing top-right */}
    <g transform="translate(635, 215) rotate(45)">
      <polygon
        points="0,-60 17,-18 60,-18 24,8 38,50 0,23 -38,50 -24,8 -60,-18 -17,-18"
        fill="#FFFFFF"
      />
    </g>
    {/* Dynamic shading */}
    <rect width="900" height="600" fill="url(#flagWaveShade)" />
  </svg>
);

const PakistanIndependenceTheme = () => {
  return null;
};

export default PakistanIndependenceTheme;
