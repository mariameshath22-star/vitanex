import React, { useState } from "react";
import {
  MapPin,
  Filter,
  Navigation,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Utensils,
  Sprout,
  HeartPulse,
  Layers,
  Radio,
} from "lucide-react";
import { ServiceProvider, ServiceReceiver, MatchRecord, ServiceCategory } from "../types";

interface CommunityMapProps {
  providers: ServiceProvider[];
  receivers: ServiceReceiver[];
  matches: MatchRecord[];
  onSelectMatch: (match: MatchRecord) => void;
}

export const CommunityMap: React.FC<CommunityMapProps> = ({
  providers,
  receivers,
  matches,
  onSelectMatch,
}) => {
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | "all">("all");
  const [selectedPin, setSelectedPin] = useState<{
    type: "provider" | "receiver";
    data: ServiceProvider | ServiceReceiver;
  } | null>(null);

  const filteredProviders = providers.filter(
    (p) => filterCategory === "all" || p.category === filterCategory
  );
  const filteredReceivers = receivers.filter(
    (r) => filterCategory === "all" || r.category === filterCategory
  );

  // Map coordinate bounding box for Tamil Nadu rural hubs
  // Lat: 10.8 to 12.3, Lng: 76.8 to 78.4
  const minLat = 10.8;
  const maxLat = 12.3;
  const minLng = 76.8;
  const maxLng = 78.4;

  const projectCoords = (lat: number, lng: number) => {
    // Normalizes to 0-100% SVG coordinates
    const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 75 + 12;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-4 space-y-4">
      {/* Map Header Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
              Live Rural Village Radar & Geo Map
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualizing real-time assistance hubs, farmers, community kitchens, and emergency volunteers.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterCategory === "all"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setFilterCategory("food")}
            className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
              filterCategory === "food"
                ? "bg-amber-500 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🍱</span>
            <span>Food</span>
          </button>
          <button
            onClick={() => setFilterCategory("agriculture")}
            className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
              filterCategory === "agriculture"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🌾</span>
            <span>Agri</span>
          </button>
          <button
            onClick={() => setFilterCategory("social")}
            className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
              filterCategory === "social"
                ? "bg-teal-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🏥</span>
            <span>Social</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[520px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-lg select-none">
        {/* Radar concentric sweep circles */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="50%" r="20%" stroke="#10b981" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="35%" stroke="#10b981" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="48%" stroke="#10b981" strokeWidth="1" fill="none" />
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#10b981" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#10b981" strokeWidth="1" strokeDasharray="2 4" />
        </svg>

        {/* Map Top-Right Legend */}
        <div className="absolute top-4 right-4 z-10 bg-slate-800/90 backdrop-blur border border-slate-700 p-3 rounded-2xl text-[11px] text-slate-300 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-white uppercase text-[10px] tracking-wider border-b border-slate-700 pb-1">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Map Legend</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-300/40"></span>
            <span>Service Provider (Available)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-300/40 animate-pulse"></span>
            <span>Service Receiver (Needs Help)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-0.5 border-t-2 border-dashed border-teal-400"></span>
            <span>Matched Pair Connection</span>
          </div>
        </div>

        {/* Bottom Left District Tag */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-800/80 backdrop-blur border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-slate-300 flex items-center space-x-2">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Rural Support Zone: Salem • Erode • Namakkal • Dharmapuri</span>
        </div>

        {/* Matched connection lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {matches.map((m) => {
            const p = providers.find((prov) => prov.id === m.providerId);
            const r = receivers.find((recv) => recv.id === m.receiverId);
            if (!p || !r) return null;

            const pPos = projectCoords(p.coordinates.lat, p.coordinates.lng);
            const rPos = projectCoords(r.coordinates.lat, r.coordinates.lng);

            return (
              <g key={m.id}>
                <line
                  x1={`${pPos.x}%`}
                  y1={`${pPos.y}%`}
                  x2={`${rPos.x}%`}
                  y2={`${rPos.y}%`}
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
                <circle
                  cx={`${(pPos.x + rPos.x) / 2}%`}
                  cy={`${(pPos.y + rPos.y) / 2}%`}
                  r="12"
                  fill="#065f46"
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
                <text
                  x={`${(pPos.x + rPos.x) / 2}%`}
                  y={`${(pPos.y + rPos.y) / 2 + 1}%`}
                  fill="#ffffff"
                  fontSize="9"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontWeight="bold"
                >
                  {m.distanceKm}km
                </text>
              </g>
            );
          })}
        </svg>

        {/* Provider Markers (Green Pins) */}
        {filteredProviders.map((p) => {
          const pos = projectCoords(p.coordinates.lat, p.coordinates.lng);
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPin({ type: "provider", data: p })}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-sm transform transition-transform group-hover:scale-125">
                  {p.category === "food" ? "🍱" : p.category === "agriculture" ? "🌾" : "🏥"}
                </div>
              </div>
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {p.name.split(" ")[0]} (Provider)
              </div>
            </div>
          );
        })}

        {/* Receiver Markers (Amber Pins) */}
        {filteredReceivers.map((r) => {
          const pos = projectCoords(r.coordinates.lat, r.coordinates.lng);
          return (
            <div
              key={r.id}
              onClick={() => setSelectedPin({ type: "receiver", data: r })}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-amber-500/30 animate-pulse"></span>
                <div className="w-9 h-9 rounded-2xl bg-amber-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-sm transform transition-transform group-hover:scale-125">
                  🆘
                </div>
              </div>
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {r.name.split(" ")[0]} (Receiver)
              </div>
            </div>
          );
        })}

        {/* Selected Pin Details Overlay Card */}
        {selectedPin && (
          <div className="absolute bottom-4 right-4 z-30 w-72 sm:w-80 bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    selectedPin.type === "provider"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedPin.type === "provider" ? "Service Provider" : "Service Receiver"}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedPin.data.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-2.5 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{selectedPin.data.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <PhoneCall className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{selectedPin.data.phone}</span>
              </div>
              <p className="text-slate-700 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] leading-relaxed">
                {selectedPin.type === "provider"
                  ? (selectedPin.data as ServiceProvider).subCategory || selectedPin.data.description
                  : (selectedPin.data as ServiceReceiver).requirement || selectedPin.data.description}
              </p>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <a
                href={`tel:${selectedPin.data.phone}`}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct Call</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
