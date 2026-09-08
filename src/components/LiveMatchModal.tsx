import React from "react";
import {
  X,
  CheckCircle2,
  MessageSquare,
  PhoneCall,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { MatchRecord } from "../types";

interface LiveMatchModalProps {
  match: MatchRecord;
  onClose: () => void;
  onOpenChat: (match: MatchRecord) => void;
  onResolveMatch: (matchId: string) => void;
}

export const LiveMatchModal: React.FC<LiveMatchModalProps> = ({
  match,
  onClose,
  onOpenChat,
  onResolveMatch,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Real-Time Proximity Match Found!</span>
          </div>

          <h3 className="text-2xl font-extrabold font-['Outfit']">
            Connection Confirmed
          </h3>
          <p className="text-emerald-100 text-xs mt-1">
            Backend auto-matched provider and receiver within{" "}
            <span className="font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">
              ~{match.distanceKm} km
            </span>{" "}
            in the <span className="capitalize font-bold">{match.category}</span> category.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Matched Parties Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Provider Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">
                🤝 Service Provider
              </span>
              <h4 className="text-base font-bold text-slate-900">{match.providerName}</h4>
              <p className="text-xs text-slate-600 font-medium mt-1 flex items-center space-x-1">
                <PhoneCall className="w-3 h-3 text-emerald-600" />
                <span>{match.providerPhone}</span>
              </p>
              <div className="mt-2 pt-2 border-t border-emerald-200/60 text-xs text-emerald-900 font-medium">
                Offer: <span className="text-slate-700">{match.providerOffer}</span>
              </div>
            </div>

            {/* Receiver Box */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block mb-1">
                🆘 Service Receiver
              </span>
              <h4 className="text-base font-bold text-slate-900">{match.receiverName}</h4>
              <p className="text-xs text-slate-600 font-medium mt-1 flex items-center space-x-1">
                <PhoneCall className="w-3 h-3 text-amber-600" />
                <span>{match.receiverPhone}</span>
              </p>
              <div className="mt-2 pt-2 border-t border-amber-200/60 text-xs text-amber-900 font-medium">
                Needs: <span className="text-slate-700">{match.receiverRequirement}</span>
              </div>
            </div>
          </div>

          {/* Location & Proximity */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{match.location}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(match.matchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onOpenChat(match)}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Real-Time Chat & Coordinate</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${match.providerPhone}`}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Provider</span>
              </a>

              <a
                href={`tel:${match.receiverPhone}`}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                <span>Call Receiver</span>
              </a>
            </div>

            {match.status !== "completed" && (
              <button
                onClick={() => onResolveMatch(match.id)}
                className="w-full py-2 px-3 text-xs text-slate-500 hover:text-emerald-700 font-medium transition-colors cursor-pointer text-center flex items-center justify-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Assistance Completed & Close Ticket</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
