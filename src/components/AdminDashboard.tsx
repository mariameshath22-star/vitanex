import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  PhoneCall,
  Search,
  MessageSquare,
  Package,
  Tractor,
  HeartPulse,
} from "lucide-react";
import { ServiceProvider, ServiceReceiver, MatchRecord, PlatformStats } from "../types";

interface AdminDashboardProps {
  providers: ServiceProvider[];
  receivers: ServiceReceiver[];
  matches: MatchRecord[];
  stats: PlatformStats | null;
  onRefreshData: () => void;
  onSeedDemoData: () => void;
  onOpenChat: (match: MatchRecord) => void;
  onResolveMatch: (matchId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  providers,
  receivers,
  matches,
  stats,
  onRefreshData,
  onSeedDemoData,
  onOpenChat,
  onResolveMatch,
}) => {
  const [activeTableTab, setActiveTableTab] = useState<"providers" | "receivers" | "matches">("providers");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    await onSeedDemoData();
    setIsSeeding(false);
  };

  const filteredProviders = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReceivers = receivers.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requirement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMatches = matches.filter(
    (m) =>
      m.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto my-6 space-y-6">
      {/* Top Banner & Control Actions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
              Admin Console
            </span>
            <span className="text-xs text-slate-500">• Firebase Firestore & Realtime DB Live Sync</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            Community Support Operations Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Monitor all active service providers, incoming emergency assistance requests, and match records.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefreshData}
            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync DB</span>
          </button>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSeeding ? "Seeding..." : "Reset / Seed Demo"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Service Providers</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-['Outfit']">
            {providers.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {providers.filter((p) => p.status === "active").length} Active on Radar
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Service Receivers</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-['Outfit']">
            {receivers.length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {receivers.filter((r) => r.status === "pending").length} Pending Help
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Matches</span>
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-['Outfit']">
            {matches.filter((m) => m.status !== "completed").length}
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            Real-time proximity pairings
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Resolved Cases</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-['Outfit']">
            {matches.filter((m) => m.status === "completed").length}
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">
            Assistance delivered successfully
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Navigation & Search Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveTableTab("providers")}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTableTab === "providers"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active Providers ({providers.length})
            </button>

            <button
              onClick={() => setActiveTableTab("receivers")}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTableTab === "receivers"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active Receivers ({receivers.length})
            </button>

            <button
              onClick={() => setActiveTableTab("matches")}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTableTab === "matches"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Matched Connections ({matches.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Tab 1: Providers Table */}
        {activeTableTab === "providers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Provider Name</th>
                  <th className="px-5 py-3">Category & Offer</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Availability</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No service providers found.
                    </td>
                  </tr>
                ) : (
                  filteredProviders.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {p.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="capitalize font-semibold text-slate-800">
                          {p.category === "food" ? "🍱 " : p.category === "agriculture" ? "🌾 " : "🏥 "}
                          {p.category}
                        </span>
                        <div className="text-[11px] text-slate-500">{p.subCategory}</div>
                      </td>
                      <td className="px-5 py-3.5">{p.location}</td>
                      <td className="px-5 py-3.5 text-slate-700">{p.availability}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            p.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "matched"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium">
                        <a
                          href={`tel:${p.phone}`}
                          className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-semibold"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{p.phone}</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Receivers Table */}
        {activeTableTab === "receivers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Receiver Name</th>
                  <th className="px-5 py-3">Category & Requirement</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Urgency</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No service receivers found.
                    </td>
                  </tr>
                ) : (
                  filteredReceivers.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {r.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="capitalize font-semibold text-slate-800">
                          {r.category === "food" ? "🍱 " : r.category === "agriculture" ? "🌾 " : "🏥 "}
                          {r.category}
                        </span>
                        <div className="text-[11px] text-slate-500">{r.requirement}</div>
                      </td>
                      <td className="px-5 py-3.5">{r.location}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            r.urgency === "critical"
                              ? "bg-rose-100 text-rose-800"
                              : r.urgency === "moderate"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.urgency}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            r.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : r.status === "matched"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium">
                        <a
                          href={`tel:${r.phone}`}
                          className="inline-flex items-center space-x-1 text-amber-700 hover:text-amber-900 font-semibold"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{r.phone}</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Matches Table */}
        {activeTableTab === "matches" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Category & Distance</th>
                  <th className="px-5 py-3">Provider</th>
                  <th className="px-5 py-3">Receiver</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No matched connections yet.
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 capitalize flex items-center space-x-1">
                          <span>{m.category === "food" ? "🍱" : m.category === "agriculture" ? "🌾" : "🏥"}</span>
                          <span>{m.category}</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          ~{m.distanceKm} km proximity
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{m.providerName}</div>
                        <div className="text-[11px] text-slate-500">{m.providerPhone}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{m.receiverName}</div>
                        <div className="text-[11px] text-slate-500">{m.receiverPhone}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            m.status === "completed"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => onOpenChat(m)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                        {m.status !== "completed" && (
                          <button
                            onClick={() => onResolveMatch(m.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Resolve</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
