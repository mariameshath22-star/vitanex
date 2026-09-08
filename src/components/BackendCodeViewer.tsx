import React, { useState, useEffect } from "react";
import { Code2, Copy, Check, Terminal, FileCode, Shield, Server, ExternalLink } from "lucide-react";

export const BackendCodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>("functions/index.js");
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/backend-files")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.files) {
          setFileContents(data.files);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    const text = fileContents[activeFile] || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCode = fileContents[activeFile] || "// Loading backend program source...";

  return (
    <div className="w-full max-w-6xl mx-auto my-6 space-y-6">
      {/* Overview Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase">
            Backend Architecture & Source Programs
          </span>
          <span className="text-xs text-slate-500">• Ready for Firebase CLI Deployment</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
          Firebase Backend Programs & Matching Engine
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          Here are the production backend programs powering Vitanex Fusion. They run directly in this full-stack app via Express + Vite and are also organized for instant export to Firebase Cloud Functions and Realtime Database.
        </p>

        {/* 3 Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm mb-2">
              <Server className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">1. Realtime DB & Firestore</h4>
            <p className="text-xs text-slate-600 mt-1">
              Stores providers under <code className="bg-slate-200/70 px-1 rounded">/providers/{"{category}"}</code> and receivers under <code className="bg-slate-200/70 px-1 rounded">/receivers/{"{category}"}</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm mb-2">
              <Code2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">2. Proximity Matching Engine</h4>
            <p className="text-xs text-slate-600 mt-1">
              Executes Haversine distance calculations between village coordinates to auto-match nearby help within 35 km.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-sm mb-2">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">3. FCM Notifications & Chat</h4>
            <p className="text-xs text-slate-600 mt-1">
              Dispatches push notifications to both parties upon matching and provisions a real-time messaging channel.
            </p>
          </div>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Code Header Tab bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 mr-3">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>

            <button
              onClick={() => setActiveFile("functions/index.js")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeFile === "functions/index.js"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>functions/index.js</span>
            </button>

            <button
              onClick={() => setActiveFile("database.rules.json")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeFile === "database.rules.json"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>database.rules.json</span>
            </button>

            <button
              onClick={() => setActiveFile("firestore.rules")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeFile === "firestore.rules"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>firestore.rules</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Program Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <pre className="p-5 text-xs text-slate-200 font-mono overflow-x-auto leading-relaxed max-h-[480px]">
          <code>{currentCode}</code>
        </pre>
      </div>

      {/* Deployment Quick Guide */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            How to Deploy Backend Programs to Firebase:
          </h3>
        </div>

        <div className="mt-4 space-y-3 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800">
            npm install -g firebase-tools<br />
            firebase login<br />
            firebase init (select Functions & Realtime Database)<br />
            firebase deploy --only functions,database
          </div>
          <p>
            Once deployed, whenever a user clicks <strong>serviceProvide</strong> or <strong>Need service</strong>, the Cloud Functions automatically trigger, match coordinates, and emit FCM push alerts to both mobile devices and web browsers!
          </p>
        </div>
      </div>
    </div>
  );
};
