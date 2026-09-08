import React from "react";
import { Utensils, Sprout, HeartPulse, Sparkles, CheckCircle2 } from "lucide-react";
import { ServiceCategory } from "../types";

interface CategorySelectorProps {
  selectedCategory: ServiceCategory;
  onSelectCategory: (category: ServiceCategory) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = [
    {
      id: "food" as ServiceCategory,
      title: "Food Help",
      icon: Utensils,
      emoji: "🍱",
      tagline: "Donors & Seekers",
      description: "Surplus meals, cooked food packages, dry rations, and hunger support in local rural zones.",
      accentBorder: "border-amber-500",
      activeBg: "bg-amber-500 text-white shadow-lg shadow-amber-200",
      inactiveBg: "bg-white hover:border-amber-300 text-slate-800",
      badgeColor: "bg-amber-100 text-amber-800",
      highlight: "Food Donors & Hungry Families",
    },
    {
      id: "agriculture" as ServiceCategory,
      title: "Agriculture Help",
      icon: Sprout,
      emoji: "🌾",
      tagline: "Farmer & Customer",
      description: "Tractor & pump loans, organic produce direct-buy, pest remedies, seed & equipment aid.",
      accentBorder: "border-emerald-600",
      activeBg: "bg-emerald-600 text-white shadow-lg shadow-emerald-200",
      inactiveBg: "bg-white hover:border-emerald-300 text-slate-800",
      badgeColor: "bg-emerald-100 text-emerald-800",
      highlight: "Farmers, Equipment & Fresh Produce",
    },
    {
      id: "social" as ServiceCategory,
      title: "Rural Social Service Help",
      icon: HeartPulse,
      emoji: "🏥",
      tagline: "Rural People & Volunteers",
      description: "Household temporary crisis, plumbing & power fix, medical transit, eldercare & village volunteer chat.",
      accentBorder: "border-teal-600",
      activeBg: "bg-teal-600 text-white shadow-lg shadow-teal-200",
      inactiveBg: "bg-white hover:border-teal-300 text-slate-800",
      badgeColor: "bg-teal-100 text-teal-800",
      highlight: "Household Problems & Volunteers",
    },
  ];

  return (
    <div className="w-full">
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1: Choose Help Category</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
          How would you like to connect today?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-1.5">
          Select a category to offer assistance or request emergency community support.
        </p>
      </div>

      {/* 3 Main Category Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? `${cat.accentBorder} bg-white shadow-md ring-2 ring-emerald-400/20`
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {/* Category Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                      isSelected ? cat.activeBg : "bg-slate-100 text-slate-700 group-hover:scale-105"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Active Category
                    </span>
                  ) : (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cat.badgeColor}`}>
                      {cat.tagline}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] group-hover:text-emerald-700 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5 mb-2">{cat.highlight}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>
              </div>

              {/* Bottom selection bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Click to activate</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
