import React, { useState, useEffect } from "react";
import {
  Send,
  Sparkles,
  MapPin,
  Phone,
  User,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle2,
  PackageCheck,
  Tractor,
  Wrench,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { ServiceCategory, UserRole, MatchRecord } from "../types";
import { RURAL_HUBS } from "../data/mockLocations";
import confetti from "canvas-confetti";

interface HelpFormSectionProps {
  category: ServiceCategory;
  role: UserRole;
  onSubmitSuccess: (match: MatchRecord | null, submittedData: any) => void;
}

export const HelpFormSection: React.FC<HelpFormSectionProps> = ({
  category,
  role,
  onSubmitSuccess,
}) => {
  // Common Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedHub, setSelectedHub] = useState(RURAL_HUBS[0].name);
  const [customLocation, setCustomLocation] = useState("");
  const [description, setDescription] = useState("");

  // Provider-Specific Fields
  const [subCategory, setSubCategory] = useState("");
  const [availability, setAvailability] = useState("Immediate");
  const [capacityOrSpecs, setCapacityOrSpecs] = useState("");

  // Receiver-Specific Fields
  const [requirement, setRequirement] = useState("");
  const [urgency, setUrgency] = useState<"critical" | "moderate" | "flexible">("critical");

  // State flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set intelligent defaults when category or role changes
  useEffect(() => {
    setConfirmationMessage(null);
    setErrorMessage(null);

    if (category === "food") {
      if (role === "provider") {
        setSubCategory("Cooked Meals Donor");
        setCapacityOrSpecs("50 Vegetarian Meal Trays");
        setAvailability("Ready Now (within 2 hours)");
        setDescription("Freshly cooked meals prepared with clean drinking water and packed in hygienic boxes.");
      } else {
        setRequirement("Lunch packets for 15 elderly villagers");
        setUrgency("critical");
        setDescription("Elderly villagers cut off by flash waterlogging near west canal need warm cooked food.");
      }
    } else if (category === "agriculture") {
      if (role === "provider") {
        setSubCategory("Tractor & Rotavator Equipment Loan");
        setCapacityOrSpecs("55HP Tractor with Diesel Operator");
        setAvailability("Tomorrow Morning 7 AM - 1 PM");
        setDescription("Available to assist marginal farmers preparing land for samba crop planting.");
      } else {
        setRequirement("Urgent Portable Water Pump for Sowing");
        setUrgency("critical");
        setDescription("Well motor burned out; need 5HP kerosene/diesel pump for 4 hours to save paddy nursery.");
      }
    } else if (category === "social") {
      if (role === "provider") {
        setSubCategory("Volunteer Medical Transit & Emergency Fix");
        setCapacityOrSpecs("Maruti Eeco with First Aid Kit & Toolbox");
        setAvailability("24/7 Emergency Support");
        setDescription("Available for emergency rides to Taluk Hospital and temporary household power/water repairs.");
      } else {
        setRequirement("Household Power Line Tripping & Sick Elder");
        setUrgency("critical");
        setDescription("Main electrical switchboard sparks and power failed; 78yo patient at home requires nebulizer.");
      }
    }
  }, [category, role]);

  // Quick fill sample data button for judges / testers
  const handleQuickFill = () => {
    if (category === "food") {
      if (role === "provider") {
        setName("Lakshmi Community Kitchen");
        setPhone("+91 94432 10987");
        setSelectedHub(RURAL_HUBS[0].name);
        setSubCategory("Surplus Cooked Meals Donor");
        setCapacityOrSpecs("40 Hot Meal Kits (Rice, Dal, Veg)");
        setAvailability("Available within 1 hour");
        setDescription("Packaged wholesome food from wedding hall surplus, ready for immediate pickup or delivery.");
      } else {
        setName("Ramesh (Tea Plantation Workers)");
        setPhone("+91 98421 65432");
        setSelectedHub(RURAL_HUBS[0].name);
        setRequirement("Food packets for 30 daily wage laborers");
        setUrgency("critical");
        setDescription("Work suspended due to torrential rain; need urgent dry rations or cooked food packages.");
      }
    } else if (category === "agriculture") {
      if (role === "provider") {
        setName("Sundaram Agri Implements Hub");
        setPhone("+91 97865 43210");
        setSelectedHub(RURAL_HUBS[1].name);
        setSubCategory("Submersible Pump & Generator Sharing");
        setCapacityOrSpecs("7.5 HP Portable Diesel Pump");
        setAvailability("Today afternoon 2 PM - 6 PM");
        setDescription("Free agricultural machinery sharing for local farmers needing emergency irrigation.");
      } else {
        setName("Muthusamy (Organic Millet Farmer)");
        setPhone("+91 96554 32109");
        setSelectedHub(RURAL_HUBS[1].name);
        setRequirement("Paddy Harvester or Tiller for 2 Acres");
        setUrgency("moderate");
        setDescription("Seeking tractor or small harvester for tomorrow morning before rains commence.");
      }
    } else {
      if (role === "provider") {
        setName("Kavitha (Rural Health Worker & Volunteer)");
        setPhone("+91 94876 54321");
        setSelectedHub(RURAL_HUBS[2].name);
        setSubCategory("Emergency Hospital Transit & Medication");
        setCapacityOrSpecs("Four-wheeler + First Aid & BP monitor");
        setAvailability("Immediate on-call");
        setDescription("Volunteer driver certified in basic life support and elder care assistance.");
      } else {
        setName("Annamalai (Panchayat Resident)");
        setPhone("+91 99443 21876");
        setSelectedHub(RURAL_HUBS[2].name);
        setRequirement("Broken Drinking Water Pipeline Emergency");
        setUrgency("critical");
        setDescription("Main PVC pipeline supplying 12 homes broke; need volunteer with pipe adhesive or plumbing tools.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage("Please fill in your Name and Phone Number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const hub = RURAL_HUBS.find((h) => h.name === selectedHub) || RURAL_HUBS[0];
    const finalLocation = customLocation.trim() ? `${customLocation} (${hub.district})` : hub.name;

    try {
      if (role === "provider") {
        const payload = {
          name: name.trim(),
          phone: phone.trim(),
          category,
          subCategory: subCategory.trim() || "Community Service",
          location: finalLocation,
          coordinates: { lat: hub.lat, lng: hub.lng },
          availability,
          capacityOrSpecs,
          description: description.trim(),
        };

        const res = await fetch("/api/providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success) {
          // Explicit confirmation as requested by user prompt
          setConfirmationMessage("Your request has been sent.");
          if (data.matched) {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          }
          onSubmitSuccess(data.match || null, payload);
        } else {
          setErrorMessage(data.error || "Failed to submit provider details.");
        }
      } else {
        const payload = {
          name: name.trim(),
          phone: phone.trim(),
          category,
          requirement: requirement.trim() || "Assistance needed",
          urgency,
          location: finalLocation,
          coordinates: { lat: hub.lat, lng: hub.lng },
          description: description.trim(),
        };

        const res = await fetch("/api/receivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success) {
          // Explicit confirmation as requested by user prompt
          setConfirmationMessage("Your request has been sent.");
          if (data.matched) {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          }
          onSubmitSuccess(data.match || null, payload);
        } else {
          setErrorMessage(data.error || "Failed to submit receiver details.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error submitting request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Titles based on category & role
  const getFormTitle = () => {
    if (category === "food") {
      return role === "provider"
        ? { title: "Food Donor & Community Kitchen Form", subtitle: "Register surplus meals or rations to distribute to nearby hungry families" }
        : { title: "Food Seeker Request Form", subtitle: "Request urgent cooked meals, rations, or food packages for your locality" };
    } else if (category === "agriculture") {
      return role === "provider"
        ? { title: "Farmer Support & Agro Provider Form", subtitle: "Offer farm machinery, irrigation pumps, seeds, or direct organic produce" }
        : { title: "Farmer & Customer Assistance Form", subtitle: "Submit irrigation, equipment, seed breakdown, or crop purchase needs" };
    } else {
      return role === "provider"
        ? { title: "Rural Volunteer & Handyman Form", subtitle: "Volunteer for emergency household repair, medical transport, and social chat" }
        : { title: "Rural Resident & Household Problem Form", subtitle: "Request immediate support for household fixes, elder transit, or village crisis" };
    }
  };

  const formMeta = getFormTitle();

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 my-4 transition-all">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                role === "provider" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {role === "provider" ? "Service Provider (Offering Help)" : "Service Receiver (Needing Help)"}
            </span>
            <span className="text-xs font-semibold text-slate-500 capitalize">
              • {category} Support
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit'] mt-1.5">
            {formMeta.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{formMeta.subtitle}</p>
        </div>

        {/* Quick Fill Button */}
        <button
          type="button"
          onClick={handleQuickFill}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          title="Fill realistic rural demo data"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Demo Auto-Fill</span>
        </button>
      </div>

      {/* Confirmation Toast */}
      {confirmationMessage && (
        <div className="my-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start space-x-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">{confirmationMessage}</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Saved under <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">/{role}s/{category}</code>. Auto-matching nearby community members in real time.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="my-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Actual Form */}
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        {/* Section 1: Common User Details */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Common User Details</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name / Organization <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={role === "provider" ? "e.g. Murugan Community Kitchen" : "e.g. Palanisamy"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 94431 88201"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Location & Proximity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Location / Rural Village Area</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Auto-coordinates for matching</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
            >
              {RURAL_HUBS.map((hub) => (
                <option key={hub.name} value={hub.name}>
                  {hub.name} ({hub.district})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Specific street, landmark or ward (optional)"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Section 3: Specific Form depending on Category & Role */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 uppercase tracking-wide">
              {category === "food" && <PackageCheck className="w-4 h-4 text-amber-600" />}
              {category === "agriculture" && <Tractor className="w-4 h-4 text-emerald-600" />}
              {category === "social" && <Wrench className="w-4 h-4 text-teal-600" />}
              <span>{category.toUpperCase()} Specific Requirements</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {role === "provider" ? "Offer Capabilities" : "Urgency & Needs"}
            </span>
          </div>

          {/* If Provider: subCategory + capacity + availability */}
          {role === "provider" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {category === "food"
                      ? "Food Type / Offer Category"
                      : category === "agriculture"
                      ? "Agro Service / Equipment Type"
                      : "Volunteer Skill / Problem Solved"}
                  </label>
                  <input
                    type="text"
                    required
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    placeholder="e.g. Cooked Lunch Packages"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {category === "food"
                      ? "Quantity / Meals Available"
                      : category === "agriculture"
                      ? "Machine Model or Crop Quantity"
                      : "Tools / Vehicle Details"}
                  </label>
                  <input
                    type="text"
                    value={capacityOrSpecs}
                    onChange={(e) => setCapacityOrSpecs(e.target.value)}
                    placeholder="e.g. 50 packets / 45HP Tractor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Availability Window</span>
                </label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Ready Now, 11 AM - 3 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : (
            /* If Receiver: requirement + urgency */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {category === "food"
                    ? "Specific Food Requirement & Headcount"
                    : category === "agriculture"
                    ? "Agricultural Problem / Equipment Needed"
                    : "Household Real-Time Crisis / Medical Support"}
                </label>
                <input
                  type="text"
                  required
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="e.g. Dinner packets for 20 workers"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "critical", label: "🚨 Critical / Emergency", desc: "Need within 2 hrs" },
                    { id: "moderate", label: "⚡ Moderate Priority", desc: "Needed today" },
                    { id: "flexible", label: "🌱 Flexible Timing", desc: "This week" },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        urgency === u.id
                          ? "border-amber-600 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{u.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{u.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Additional Situation Description</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact landmark, dietary restrictions, problem details or special instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Submit / Connect Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-6 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer ${
              role === "provider"
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 active:scale-[0.99]"
                : "bg-amber-600 hover:bg-amber-700 shadow-amber-200 active:scale-[0.99]"
            } ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending details to Backend...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>
                  {role === "provider" ? "Submit & Publish as Service Provider" : "Submit / Connect & Find Nearby Helpers"}
                </span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-400 mt-2 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted transmission to /providers or /receivers with auto-proximity matching</span>
          </p>
        </div>
      </form>
    </div>
  );
};
