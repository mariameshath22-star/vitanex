import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { CategorySelector } from "./components/CategorySelector";
import { RoleActionBar } from "./components/RoleActionBar";
import { HelpFormSection } from "./components/HelpFormSection";
import { LiveMatchModal } from "./components/LiveMatchModal";
import { LiveChatModal } from "./components/LiveChatModal";
import { CommunityMap } from "./components/CommunityMap";
import { AdminDashboard } from "./components/AdminDashboard";
import { BackendCodeViewer } from "./components/BackendCodeViewer";
import {
  ServiceCategory,
  UserRole,
  ServiceProvider,
  ServiceReceiver,
  MatchRecord,
  NotificationItem,
  PlatformStats,
} from "./types";
import {
  HeartHandshake,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Radio,
  MapPin,
  Clock,
  PhoneCall,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"portal" | "map" | "admin" | "backend">("portal");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("food");
  const [selectedRole, setSelectedRole] = useState<UserRole>("provider");

  // State collections from backend
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [receivers, setReceivers] = useState<ServiceReceiver[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  // Active Modals
  const [activeMatchModal, setActiveMatchModal] = useState<MatchRecord | null>(null);
  const [activeChatModal, setActiveChatModal] = useState<MatchRecord | null>(null);

  // Toast banner for recent match or notification
  const [recentNotificationToast, setRecentNotificationToast] = useState<NotificationItem | null>(null);

  // Fetch all live data from backend server
  const fetchAllData = async () => {
    try {
      const [provRes, recvRes, matchRes, notifRes, statsRes] = await Promise.all([
        fetch("/api/providers").then((r) => r.json()),
        fetch("/api/receivers").then((r) => r.json()),
        fetch("/api/matches").then((r) => r.json()),
        fetch("/api/notifications").then((r) => r.json()),
        fetch("/api/stats").then((r) => r.json()),
      ]);

      if (provRes.success) setProviders(provRes.providers);
      if (recvRes.success) setReceivers(recvRes.receivers);
      if (matchRes.success) setMatches(matchRes.matches);
      if (notifRes.success) setNotifications(notifRes.notifications);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error("Error synchronizing with Vitanex Fusion backend:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle successful submission from form
  const handleFormSubmitSuccess = (match: MatchRecord | null, _submittedData: any) => {
    fetchAllData();
    if (match) {
      setActiveMatchModal(match);
      setRecentNotificationToast({
        id: `toast_${Date.now()}`,
        recipientRole: selectedRole,
        recipientName: match.receiverName,
        recipientPhone: match.receiverPhone,
        title: "⚡ Proximity Match Found!",
        message: `Connected with ${match.providerName} & ${match.receiverName} (~${match.distanceKm} km away).`,
        timestamp: Date.now(),
        read: false,
        matchId: match.id,
        category: match.category,
      });
    }
  };

  const handleResolveMatch = async (matchId: string) => {
    try {
      await fetch(`/api/matches/${matchId}/resolve`, { method: "POST" });
      fetchAllData();
      if (activeMatchModal && activeMatchModal.id === matchId) {
        setActiveMatchModal(null);
      }
    } catch (e) {
      console.error("Error resolving match:", e);
    }
  };

  const handleSeedDemoData = async () => {
    try {
      await fetch("/api/demo/seed", { method: "POST" });
      fetchAllData();
    } catch (e) {
      console.error("Error seeding demo:", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Header with brand, live indicators and notification hub */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onOpenNotification={(notif) => {
          if (notif.matchId) {
            const m = matches.find((item) => item.id === notif.matchId);
            if (m) setActiveMatchModal(m);
          }
        }}
        onClearNotifications={() => setNotifications([])}
      />

      {/* Real-time Match Banner Toast */}
      {recentNotificationToast && (
        <div className="fixed top-20 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 rounded-2xl bg-white shadow-2xl border-2 border-emerald-500 flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  FCM Push Simulated
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {recentNotificationToast.title}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {recentNotificationToast.message}
                </p>
                {recentNotificationToast.matchId && (
                  <button
                    onClick={() => {
                      const m = matches.find((item) => item.id === recentNotificationToast.matchId);
                      if (m) setActiveMatchModal(m);
                      setRecentNotificationToast(null);
                    }}
                    className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    View Connection Details →
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setRecentNotificationToast(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "portal" && (
          <div className="space-y-8">
            {/* Hero Welcoming Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-10 shadow-md">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-semibold mb-3 border border-white/20">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Real-Time Community Support Network</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit']">
                  Connecting Providers & Receivers in Real-Time
                </h1>
                <p className="text-slate-200 text-sm sm:text-base mt-2 leading-relaxed">
                  A unified platform for rural community resilience. Share food surplus, resolve agricultural bottlenecks, solve temporary household crises, and mobilize social service volunteers.
                </p>

                {/* Quick highlights */}
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                  <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>🍱 Food Help</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>🌾 Agriculture Problem Help</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    <span>🏥 Rural Social Service & Household Fix</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. Category Selector (Three main category buttons at the top/center) */}
            <section id="category-section" className="py-2">
              <CategorySelector
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
              />
            </section>

            {/* 2. Role Action Bar (Bottom section with Left "Service Provider" and Right "Service Receiver") */}
            <section id="role-section" className="py-2">
              <RoleActionBar
                selectedRole={selectedRole}
                onSelectRole={(role) => setSelectedRole(role)}
                category={selectedCategory}
              />
            </section>

            {/* 3. Respective Form Section with Smooth Transitions */}
            <section id="form-section">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCategory}-${selectedRole}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <HelpFormSection
                    category={selectedCategory}
                    role={selectedRole}
                    onSubmitSuccess={handleFormSubmitSuccess}
                  />
                </motion.div>
              </AnimatePresence>
            </section>

            {/* Recent Live Matches Showcase */}
            {matches.length > 0 && (
              <section className="mt-10 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Recent Auto-Matched Community Connections</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Nearby pairs matched by Vitanex Fusion's spatial algorithm.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View All ({matches.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setActiveMatchModal(m)}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 uppercase">
                          {m.category} Matched
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          ~{m.distanceKm} km away
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Provider:</span>
                          <span className="font-bold text-slate-800">{m.providerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Receiver:</span>
                          <span className="font-bold text-slate-800">{m.receiverName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate pt-1">
                          📍 {m.location}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                        <span>Open Connection Card</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Tab 2: Community Map */}
        {activeTab === "map" && (
          <CommunityMap
            providers={providers}
            receivers={receivers}
            matches={matches}
            onSelectMatch={(m) => setActiveMatchModal(m)}
          />
        )}

        {/* Tab 3: Admin Dashboard */}
        {activeTab === "admin" && (
          <AdminDashboard
            providers={providers}
            receivers={receivers}
            matches={matches}
            stats={stats}
            onRefreshData={fetchAllData}
            onSeedDemoData={handleSeedDemoData}
            onOpenChat={(m) => setActiveChatModal(m)}
            onResolveMatch={handleResolveMatch}
          />
        )}

        {/* Tab 4: Backend Programs & Code */}
        {activeTab === "backend" && <BackendCodeViewer />}
      </main>

      {/* Active Match Connection Modal */}
      {activeMatchModal && (
        <LiveMatchModal
          match={activeMatchModal}
          onClose={() => setActiveMatchModal(null)}
          onOpenChat={(m) => {
            setActiveMatchModal(null);
            setActiveChatModal(m);
          }}
          onResolveMatch={(id) => handleResolveMatch(id)}
        />
      )}

      {/* Real-time Chat Modal */}
      {activeChatModal && (
        <LiveChatModal
          match={activeChatModal}
          onClose={() => setActiveChatModal(null)}
        />
      )}

      {/* Modern Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800 font-['Outfit'] text-sm">
              vitanex fusion
            </span>
            <span>• Unified Rural Community Support Platform</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("portal")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Support Portal
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Village Map
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Admin Hub
            </button>
            <button
              onClick={() => setActiveTab("backend")}
              className="hover:text-emerald-700 transition-colors cursor-pointer font-semibold text-emerald-700"
            >
              Firebase Programs
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Powered by Firebase Realtime DB, Cloud Messaging & Auto-Matcher
          </div>
        </div>
      </footer>
    </div>
  );
}
