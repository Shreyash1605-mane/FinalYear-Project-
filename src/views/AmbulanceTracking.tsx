import React, { useState } from 'react';
import { MapPin, Gauge, Clock, ShieldCheck, Volume2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useAmbulance } from '../context/AmbulanceContext';

export const AmbulanceTracking: React.FC = () => {
  const { ambulance } = useAmbulance();
  const [sirenActive, setSirenActive] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(2.5, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.6, Number((prev - 0.25).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
  };

  // Calculate dynamic viewBox centered around 1000x600 for SVG zoom
  const vbWidth = 1000 / zoomLevel;
  const vbHeight = 600 / zoomLevel;
  const vbX = (1000 - vbWidth) / 2;
  const vbY = (600 - vbHeight) / 2;

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] flex flex-col">
      {/* Map Container */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-700/80 bg-[#091322] shadow-2xl">
        {/* Floating Interactive Zoom Toolbar */}
        <div className="absolute top-6 left-6 z-20 flex items-center space-x-1 bg-[#0b1328]/90 border border-slate-700/80 backdrop-blur-md p-1.5 rounded-xl shadow-xl text-slate-200 text-xs font-semibold">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Zoom In</span>
          </button>

          <span className="px-2 font-mono text-slate-400 text-[11px]">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Zoom Out</span>
          </button>

          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer border-l border-slate-700/80 ml-1 pl-2"
            title="Reset Zoom (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SVG Vector Map Rendering matching Thumbnail 3 with Dynamic Zoom */}
        <svg
          className="w-full h-full object-cover transition-all duration-300 ease-out"
          viewBox={`${vbX} ${vbY} ${vbWidth} ${vbHeight}`}
        >
          {/* Map Grid Patterns */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="1000" height="600" fill="#091322" />
          <rect width="1000" height="600" fill="url(#grid)" />

          {/* Road Networks */}
          <path d="M 0 200 Q 400 150 700 350 T 1000 300" fill="none" stroke="#1e293b" strokeWidth="40" />
          <path d="M 300 0 L 300 600 M 700 0 L 700 600" fill="none" stroke="#1e293b" strokeWidth="24" />
          <path d="M 0 450 L 1000 450" fill="none" stroke="#1e293b" strokeWidth="18" />

          {/* Red Route Line matching Thumbnail 3 */}
          <path
            d="M 150 480 Q 380 400 620 220 T 820 120"
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeDasharray="8 4"
          />

          {/* Route Waypoints (Red Dots) */}
          {[
            { x: 150, y: 480 },
            { x: 280, y: 430 },
            { x: 410, y: 350 },
            { x: 520, y: 280 },
            { x: 620, y: 220 },
            { x: 740, y: 160 },
            { x: 820, y: 120 },
          ].map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
          ))}

          {/* Moving Ambulance Vehicle Icon matching Thumbnail 3 */}
          <g transform="translate(410, 350)">
            <circle r="22" fill="#ef4444" fillOpacity="0.2" className="animate-ping" />
            <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#ffffff" stroke="#ef4444" strokeWidth="3" />
            <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">
              AMB
            </text>
          </g>

          {/* Hospital Destination Pin */}
          <g transform="translate(820, 120)">
            <circle r="30" fill="#3b82f6" fillOpacity="0.15" />
            <path
              d="M 0 -20 C -8 -20 -14 -14 -14 -6 C -14 8 0 20 0 20 C 0 20 14 8 14 -6 C 14 -14 8 -20 0 -20 Z"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text x="0" y="-3" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
              +
            </text>
            <text x="0" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">
              St. Jude Hospital
            </text>
          </g>
        </svg>

        {/* Floating Telemetry Box overlay matching Thumbnail 3 */}
        <div className="absolute top-6 right-6 w-72 bg-[#0b1328]/90 border border-slate-700/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl text-slate-100 z-10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h3 className="text-base font-extrabold text-white tracking-wide">Ambulance</h3>
              <div className="text-xs text-slate-400 font-mono">AMB-108</div>
            </div>
            <button
              onClick={() => setSirenActive(!sirenActive)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                sirenActive ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 text-slate-400'
              }`}
              title="Toggle Siren Telemetry"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{ambulance.status}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-blue-400" />
                <span>Speed</span>
              </span>
              <span className="text-white font-bold font-mono">{ambulance.speedKmh} km/h</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>ETA</span>
              </span>
              <span className="text-white font-bold font-mono">{ambulance.etaMins} mins</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Distance</span>
              </span>
              <span className="text-white font-bold font-mono">{ambulance.distanceKm} km</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GPS Lock: High</span>
            </span>
            <span className="font-mono">Live Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
