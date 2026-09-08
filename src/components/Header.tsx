import React from "react";
import { Bell, HeartHandshake, ShieldCheck, MapPin, Code2, Users, Radio } from "lucide-react";
import { NotificationItem } from "../types";

interface HeaderProps {
  activeTab: "portal" | "map" | "admin" | "backend";
  setActiveTab: (tab: "portal" | "map" | "admin" | "backend") => void;
  notifications: NotificationItem[];
  onOpenNotification: (notif: NotificationItem) => void;
  onClearNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onOpenNotification,
}) => {
  const [showNotifMenu, setShowNotifMenu] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("portal")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-['Outfit']">
                  vitanex <span className="text-emerald-600">fusion</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Unified Community Support • Food, Agriculture & Rural Services
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab("portal")}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "portal"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Support Portal</span>
            </button>

            <button
              onClick={() => setActiveTab("map")}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "map"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Village Radar & Map</span>
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "admin"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Admin Hub</span>
            </button>

            <button
              onClick={() => setActiveTab("backend")}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === "backend"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Backend Programs</span>
            </button>
          </nav>

          {/* Right Action Icons & Notification Bell */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <div className="flex items-center space-x-1.5">
                      <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Real-Time Alerts ({notifications.length})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Firebase FCM Simulator</span>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      No notifications yet. Submit a request to trigger auto-matching!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onOpenNotification(n);
                            setShowNotifMenu(false);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.read
                              ? "bg-slate-50/60 border-slate-200 text-slate-600"
                              : "bg-emerald-50/80 border-emerald-200 text-slate-900 shadow-xs"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-1">
                            <span className="text-emerald-800 flex items-center space-x-1">
                              <span>{n.title}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Safe</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setActiveTab("portal")}
            className={`py-1.5 px-2.5 rounded-lg flex items-center space-x-1 ${
              activeTab === "portal" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-600"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Portal</span>
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`py-1.5 px-2.5 rounded-lg flex items-center space-x-1 ${
              activeTab === "map" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-600"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`py-1.5 px-2.5 rounded-lg flex items-center space-x-1 ${
              activeTab === "admin" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-600"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => setActiveTab("backend")}
            className={`py-1.5 px-2.5 rounded-lg flex items-center space-x-1 ${
              activeTab === "backend" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-600"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
