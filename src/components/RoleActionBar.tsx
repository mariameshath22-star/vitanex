import React from "react";
import { HandHeart, HelpCircle, ArrowRight } from "lucide-react";
import { ServiceCategory, UserRole } from "../types";

interface RoleActionBarProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  category: ServiceCategory;
}

export const RoleActionBar: React.FC<RoleActionBarProps> = ({
  selectedRole,
  onSelectRole,
  category,
}) => {
  const getCategoryRoleLabels = () => {
    switch (category) {
      case "food":
        return {
          provider: "Food Donor / Kitchen",
          providerDesc: "I want to donate prepared food, meals, or ration kits",
          receiver: "Food Seeker / Community",
          receiverDesc: "We need urgent food or meals for families",
        };
      case "agriculture":
        return {
          provider: "Farmer Support / Seller",
          providerDesc: "I offer tractor loan, water pump, seeds, or farm crops",
          receiver: "Farmer / Customer",
          receiverDesc: "I need farm equipment, pump assistance, or crops",
        };
      case "social":
        return {
          provider: "Rural Volunteer / Fixer",
          providerDesc: "I provide medical rides, power/water repair, or aid",
          receiver: "Rural Resident / Household",
          receiverDesc: "I need temporary household fixes, transit, or support",
        };
    }
  };

  const labels = getCategoryRoleLabels();

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      <div className="text-center mb-4">
        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          Step 2: Choose Your Role
        </span>
        <h3 className="text-lg font-bold text-slate-900 mt-0.5">
          Are you offering assistance or requesting help?
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left button: Service Provider */}
        <button
          onClick={() => onSelectRole("provider")}
          className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            selectedRole === "provider"
              ? "border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  selectedRole === "provider"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <HandHeart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Left Action
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 font-['Outfit'] mt-1">
                  Service Provider
                </h4>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedRole === "provider" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"
              }`}
            >
              {selectedRole === "provider" && <span className="w-2 h-2 rounded-full bg-white"></span>}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-emerald-800">{labels.provider}</p>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{labels.providerDesc}</p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-emerald-700">
            <span>Open Provider Form</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Right button: Service Receiver */}
        <button
          onClick={() => onSelectRole("receiver")}
          className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            selectedRole === "receiver"
              ? "border-amber-600 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  selectedRole === "receiver"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Right Action
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 font-['Outfit'] mt-1">
                  Service Receiver
                </h4>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedRole === "receiver" ? "border-amber-600 bg-amber-600" : "border-slate-300"
              }`}
            >
              {selectedRole === "receiver" && <span className="w-2 h-2 rounded-full bg-white"></span>}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-amber-800">{labels.receiver}</p>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{labels.receiverDesc}</p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-amber-700">
            <span>Open Need Service Form</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
