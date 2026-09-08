import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface ProviderItem {
  id: string;
  name: string;
  phone: string;
  category: "food" | "agriculture" | "social";
  subCategory: string;
  location: string;
  coordinates: { lat: number; lng: number };
  availability: string;
  capacityOrSpecs?: string;
  description: string;
  status: "active" | "matched" | "completed";
  createdAt: number;
}

interface ReceiverItem {
  id: string;
  name: string;
  phone: string;
  category: "food" | "agriculture" | "social";
  requirement: string;
  urgency: "critical" | "moderate" | "flexible";
  location: string;
  coordinates: { lat: number; lng: number };
  description: string;
  status: "pending" | "matched" | "resolved";
  createdAt: number;
}

interface MatchItem {
  id: string;
  category: "food" | "agriculture" | "social";
  providerId: string;
  receiverId: string;
  providerName: string;
  providerPhone: string;
  receiverName: string;
  receiverPhone: string;
  location: string;
  distanceKm: number;
  providerOffer: string;
  receiverRequirement: string;
  matchedAt: number;
  status: "connected" | "in_progress" | "completed";
}

interface ChatMsg {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  senderRole: "provider" | "receiver" | "system";
  text: string;
  timestamp: number;
}

interface NotificationMsg {
  id: string;
  recipientRole: "provider" | "receiver";
  recipientName: string;
  recipientPhone: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  matchId?: string;
  category: "food" | "agriculture" | "social";
}

// Haversine distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// In-memory persistent database store (with initial sample records for instant live testing)
let providersStore: ProviderItem[] = [
  {
    id: "p_food_1",
    name: "Murugan Community Kitchen",
    phone: "+91 94431 88201",
    category: "food",
    subCategory: "Cooked Meals Donor",
    location: "Greenfield Village, Ward 3",
    coordinates: { lat: 11.6643, lng: 78.1460 },
    availability: "Available Now (11 AM - 3 PM)",
    capacityOrSpecs: "75 hot lunch packages (Rice, Sambar, Greens)",
    description: "Prepared fresh vegetarian meals from temple festival surplus. Packaged safely in food-grade foil trays.",
    status: "active",
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: "p_agro_1",
    name: "Kannan Farm Tech & Tractor Service",
    phone: "+91 98942 55104",
    category: "agriculture",
    subCategory: "Tractor & Deep Plough Loan",
    location: "Sunrise Agro Hamlet",
    coordinates: { lat: 11.3410, lng: 77.7172 },
    availability: "Morning 6 AM - 12 PM",
    capacityOrSpecs: "Mahindra 575 DI + Rotavator + Drip Pipes",
    description: "Offering free rotavator tilling assistance for smallholder farmers (< 2 acres) preparing for monsoon sowing.",
    status: "active",
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: "p_social_1",
    name: "Panchayat Volunteer Ambulance & Transport",
    phone: "+91 97893 11452",
    category: "social",
    subCategory: "Emergency Transport & First-Aid",
    location: "Oakridge Panchayat Valley",
    coordinates: { lat: 12.1211, lng: 78.1582 },
    availability: "24/7 On-Call",
    capacityOrSpecs: "Omni Van with stretcher & oxygen cylinder",
    description: "Volunteer group providing free rides to district government hospital for pregnant mothers and elderly patients.",
    status: "active",
    createdAt: Date.now() - 3600000 * 8,
  },
  {
    id: "p_social_2",
    name: "Selvam Electrical & Water Pump Fixer",
    phone: "+91 96291 44389",
    category: "social",
    subCategory: "Household Real-Time Crisis Fix",
    location: "Riverdale Farmer Colony",
    coordinates: { lat: 11.2189, lng: 78.1674 },
    availability: "Evenings 4 PM - 8 PM",
    capacityOrSpecs: "Motor rewinding kit, wire repair, pipeline sealant",
    description: "Helping rural homes resolve borewell power tripping, broken irrigation pipes, and faulty home wiring.",
    status: "active",
    createdAt: Date.now() - 3600000 * 12,
  },
];

let receiversStore: ReceiverItem[] = [
  {
    id: "r_food_1",
    name: "Palanisamy (Brick Kiln Workers Colony)",
    phone: "+91 95004 22108",
    category: "food",
    requirement: "Dinner packets for 20 migrant families",
    urgency: "critical",
    location: "Greenfield Village, Ward 3",
    coordinates: { lat: 11.6685, lng: 78.1492 },
    description: "Heavy rain flooded the cooking shed. Need cooked meals or dry ration kits for 20 people tonight.",
    status: "pending",
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: "r_agro_1",
    name: "Velusamy (Paddy Farmer)",
    phone: "+91 97512 88419",
    category: "agriculture",
    requirement: "Pumping motor failure - Need portable pump",
    urgency: "critical",
    location: "Sunrise Agro Hamlet",
    coordinates: { lat: 11.3450, lng: 77.7210 },
    description: "Submersible pump burned out; 3-acre paddy nursery will dry up if water is not supplied by evening.",
    status: "pending",
    createdAt: Date.now() - 3600000 * 3,
  },
];

let matchesStore: MatchItem[] = [];
let chatsStore: Record<string, ChatMsg[]> = {};
let notificationsStore: NotificationMsg[] = [];

// Matching Engine: Finds best candidate in the same category within proximity
function executeAutoMatch(category: "food" | "agriculture" | "social"): MatchItem | null {
  const activeProviders = providersStore.filter((p) => p.category === category && p.status === "active");
  const pendingReceivers = receiversStore.filter((r) => r.category === category && r.status === "pending");

  if (activeProviders.length === 0 || pendingReceivers.length === 0) {
    return null;
  }

  let bestPair: { provider: ProviderItem; receiver: ReceiverItem; distance: number } | null = null;
  let minDistance = Infinity;

  for (const receiver of pendingReceivers) {
    for (const provider of activeProviders) {
      const dist = calculateDistance(
        provider.coordinates.lat,
        provider.coordinates.lng,
        receiver.coordinates.lat,
        receiver.coordinates.lng
      );

      if (dist <= 40 && dist < minDistance) {
        minDistance = dist;
        bestPair = { provider, receiver, distance: dist };
      }
    }
  }

  if (!bestPair) {
    // If no coordinates match closely, pair first available if same village or within 50km
    const p = activeProviders[0];
    const r = pendingReceivers[0];
    const dist = calculateDistance(p.coordinates.lat, p.coordinates.lng, r.coordinates.lat, r.coordinates.lng) || 3.5;
    bestPair = { provider: p, receiver: r, distance: dist };
  }

  const { provider, receiver, distance } = bestPair;
  provider.status = "matched";
  receiver.status = "matched";

  const matchId = `match_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newMatch: MatchItem = {
    id: matchId,
    category,
    providerId: provider.id,
    receiverId: receiver.id,
    providerName: provider.name,
    providerPhone: provider.phone,
    receiverName: receiver.name,
    receiverPhone: receiver.phone,
    location: receiver.location || provider.location,
    distanceKm: distance,
    providerOffer: provider.subCategory || provider.description,
    receiverRequirement: receiver.requirement || receiver.description,
    matchedAt: Date.now(),
    status: "connected",
  };

  matchesStore.unshift(newMatch);

  // Add system notifications
  const notifProvider: NotificationMsg = {
    id: `notif_${Date.now()}_1`,
    recipientRole: "provider",
    recipientName: provider.name,
    recipientPhone: provider.phone,
    title: `🎉 Connected! ${receiver.name} needs your help`,
    message: `A receiver located ${distance} km away requires: "${receiver.requirement}". Open chat to coordinate help.`,
    timestamp: Date.now(),
    read: false,
    matchId,
    category,
  };

  const notifReceiver: NotificationMsg = {
    id: `notif_${Date.now()}_2`,
    recipientRole: "receiver",
    recipientName: receiver.name,
    recipientPhone: receiver.phone,
    title: `🌟 Service Provider Found: ${provider.name}`,
    message: `Helper is available ${distance} km away offering "${provider.subCategory || provider.description}". Contact info is now ready.`,
    timestamp: Date.now(),
    read: false,
    matchId,
    category,
  };

  notificationsStore.unshift(notifProvider, notifReceiver);

  // Initialize chat
  chatsStore[matchId] = [
    {
      id: `msg_sys_${Date.now()}`,
      matchId,
      senderId: "system",
      senderName: "Vitanex Fusion Auto-Matcher",
      senderRole: "system",
      text: `🤝 Real-time connection established! ${provider.name} (Provider) and ${receiver.name} (Receiver) can coordinate directly. Distance: ~${distance} km.`,
      timestamp: Date.now(),
    },
  ];

  return newMatch;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Vitanex Fusion Community Hub" });
  });

  // Providers list & search
  app.get("/api/providers", (req, res) => {
    const { category, status } = req.query;
    let list = providersStore;
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    if (status) {
      list = list.filter((p) => p.status === status);
    }
    res.json({ success: true, providers: list });
  });

  // Register Provider
  app.post("/api/providers", (req, res) => {
    const { name, phone, category, subCategory, location, coordinates, availability, capacityOrSpecs, description } = req.body;

    if (!name || !phone || !category) {
      return res.status(400).json({ success: false, error: "Name, phone, and category are required." });
    }

    const newProvider: ProviderItem = {
      id: `prov_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      phone,
      category,
      subCategory: subCategory || "Community Support",
      location: location || "Greenfield Village",
      coordinates: coordinates || { lat: 11.6643, lng: 78.1460 },
      availability: availability || "Immediate",
      capacityOrSpecs: capacityOrSpecs || "",
      description: description || "Ready to assist nearby community members.",
      status: "active",
      createdAt: Date.now(),
    };

    providersStore.unshift(newProvider);

    // Run auto match against pending receivers
    const match = executeAutoMatch(category);

    res.json({
      success: true,
      message: "Your provider profile has been published to /providers/" + category,
      provider: newProvider,
      matched: match !== null,
      match,
    });
  });

  // Receivers list & search
  app.get("/api/receivers", (req, res) => {
    const { category, status } = req.query;
    let list = receiversStore;
    if (category) {
      list = list.filter((r) => r.category === category);
    }
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    res.json({ success: true, receivers: list });
  });

  // Submit Receiver Request ("Need Service")
  app.post("/api/receivers", (req, res) => {
    const { name, phone, category, requirement, urgency, location, coordinates, description } = req.body;

    if (!name || !phone || !category) {
      return res.status(400).json({ success: false, error: "Name, phone, and category are required." });
    }

    const newReceiver: ReceiverItem = {
      id: `recv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      phone,
      category,
      requirement: requirement || "Immediate Community Help",
      urgency: urgency || "moderate",
      location: location || "Greenfield Village",
      coordinates: coordinates || { lat: 11.6643, lng: 78.1460 },
      description: description || "Assistance needed.",
      status: "pending",
      createdAt: Date.now(),
    };

    receiversStore.unshift(newReceiver);

    // Run auto match against active providers
    const match = executeAutoMatch(category);

    res.json({
      success: true,
      message: "Your request has been sent and logged under /receivers/" + category,
      receiver: newReceiver,
      matched: match !== null,
      match,
    });
  });

  // Matches list
  app.get("/api/matches", (req, res) => {
    const { category } = req.query;
    let list = matchesStore;
    if (category) {
      list = list.filter((m) => m.category === category);
    }
    res.json({ success: true, matches: list });
  });

  // Manual Trigger Match (can trigger matching for a category)
  app.post("/api/matches/trigger", (req, res) => {
    const { category } = req.body;
    const categories: ("food" | "agriculture" | "social")[] = category ? [category] : ["food", "agriculture", "social"];
    const newMatches: MatchItem[] = [];

    for (const cat of categories) {
      const m = executeAutoMatch(cat);
      if (m) newMatches.push(m);
    }

    res.json({ success: true, matchedCount: newMatches.length, matches: newMatches });
  });

  // Resolve match
  app.post("/api/matches/:id/resolve", (req, res) => {
    const { id } = req.params;
    const match = matchesStore.find((m) => m.id === id);
    if (!match) {
      return res.status(404).json({ success: false, error: "Match not found" });
    }
    match.status = "completed";

    // also update provider & receiver
    const p = providersStore.find((item) => item.id === match.providerId);
    if (p) p.status = "completed";
    const r = receiversStore.find((item) => item.id === match.receiverId);
    if (r) r.status = "resolved";

    res.json({ success: true, match });
  });

  // Notifications
  app.get("/api/notifications", (req, res) => {
    const { phone } = req.query;
    let list = notificationsStore;
    if (phone) {
      list = list.filter((n) => n.recipientPhone === phone);
    }
    res.json({ success: true, notifications: list });
  });

  app.post("/api/notifications/:id/read", (req, res) => {
    const { id } = req.params;
    const notif = notificationsStore.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
    }
    res.json({ success: true });
  });

  // Chat API
  app.get("/api/chat/:matchId", (req, res) => {
    const { matchId } = req.params;
    const messages = chatsStore[matchId] || [];
    res.json({ success: true, messages });
  });

  app.post("/api/chat/:matchId", (req, res) => {
    const { matchId } = req.params;
    const { senderId, senderName, senderRole, text } = req.body;

    if (!text || !senderName) {
      return res.status(400).json({ success: false, error: "Text and senderName are required." });
    }

    if (!chatsStore[matchId]) {
      chatsStore[matchId] = [];
    }

    const newMsg: ChatMsg = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      matchId,
      senderId: senderId || `user_${Date.now()}`,
      senderName,
      senderRole: senderRole || "provider",
      text,
      timestamp: Date.now(),
    };

    chatsStore[matchId].push(newMsg);

    res.json({ success: true, message: newMsg });
  });

  // Platform Analytics & Stats
  app.get("/api/stats", (req, res) => {
    const stats = {
      totalProviders: providersStore.length,
      totalReceivers: receiversStore.length,
      activeMatches: matchesStore.filter((m) => m.status === "connected" || m.status === "in_progress").length,
      resolvedCases: matchesStore.filter((m) => m.status === "completed").length,
      byCategory: {
        food: {
          providers: providersStore.filter((p) => p.category === "food").length,
          receivers: receiversStore.filter((r) => r.category === "food").length,
        },
        agriculture: {
          providers: providersStore.filter((p) => p.category === "agriculture").length,
          receivers: receiversStore.filter((r) => r.category === "agriculture").length,
        },
        social: {
          providers: providersStore.filter((p) => p.category === "social").length,
          receivers: receiversStore.filter((r) => r.category === "social").length,
        },
      },
    };
    res.json({ success: true, stats });
  });

  // Reset/Seed demo data
  app.post("/api/demo/seed", (req, res) => {
    // Re-seed original demo items
    providersStore = [
      {
        id: "p_food_1",
        name: "Murugan Community Kitchen",
        phone: "+91 94431 88201",
        category: "food",
        subCategory: "Cooked Meals Donor",
        location: "Greenfield Village, Ward 3",
        coordinates: { lat: 11.6643, lng: 78.1460 },
        availability: "Available Now (11 AM - 3 PM)",
        capacityOrSpecs: "75 hot lunch packages (Rice, Sambar, Greens)",
        description: "Prepared fresh vegetarian meals from temple festival surplus. Packaged safely in food-grade foil trays.",
        status: "active",
        createdAt: Date.now() - 3600000 * 2,
      },
      {
        id: "p_agro_1",
        name: "Kannan Farm Tech & Tractor Service",
        phone: "+91 98942 55104",
        category: "agriculture",
        subCategory: "Tractor & Deep Plough Loan",
        location: "Sunrise Agro Hamlet",
        coordinates: { lat: 11.3410, lng: 77.7172 },
        availability: "Morning 6 AM - 12 PM",
        capacityOrSpecs: "Mahindra 575 DI + Rotavator + Drip Pipes",
        description: "Offering free rotavator tilling assistance for smallholder farmers (< 2 acres) preparing for monsoon sowing.",
        status: "active",
        createdAt: Date.now() - 3600000 * 5,
      },
      {
        id: "p_social_1",
        name: "Panchayat Volunteer Ambulance & Transport",
        phone: "+91 97893 11452",
        category: "social",
        subCategory: "Emergency Transport & First-Aid",
        location: "Oakridge Panchayat Valley",
        coordinates: { lat: 12.1211, lng: 78.1582 },
        availability: "24/7 On-Call",
        capacityOrSpecs: "Omni Van with stretcher & oxygen cylinder",
        description: "Volunteer group providing free rides to district government hospital for pregnant mothers and elderly patients.",
        status: "active",
        createdAt: Date.now() - 3600000 * 8,
      },
      {
        id: "p_social_2",
        name: "Selvam Electrical & Water Pump Fixer",
        phone: "+91 96291 44389",
        category: "social",
        subCategory: "Household Real-Time Crisis Fix",
        location: "Riverdale Farmer Colony",
        coordinates: { lat: 11.2189, lng: 78.1674 },
        availability: "Evenings 4 PM - 8 PM",
        capacityOrSpecs: "Motor rewinding kit, wire repair, pipeline sealant",
        description: "Helping rural homes resolve borewell power tripping, broken irrigation pipes, and faulty home wiring.",
        status: "active",
        createdAt: Date.now() - 3600000 * 12,
      },
    ];

    receiversStore = [
      {
        id: "r_food_1",
        name: "Palanisamy (Brick Kiln Workers Colony)",
        phone: "+91 95004 22108",
        category: "food",
        requirement: "Dinner packets for 20 migrant families",
        urgency: "critical",
        location: "Greenfield Village, Ward 3",
        coordinates: { lat: 11.6685, lng: 78.1492 },
        description: "Heavy rain flooded the cooking shed. Need cooked meals or dry ration kits for 20 people tonight.",
        status: "pending",
        createdAt: Date.now() - 3600000 * 1,
      },
      {
        id: "r_agro_1",
        name: "Velusamy (Paddy Farmer)",
        phone: "+91 97512 88419",
        category: "agriculture",
        requirement: "Pumping motor failure - Need portable pump",
        urgency: "critical",
        location: "Sunrise Agro Hamlet",
        coordinates: { lat: 11.3450, lng: 77.7210 },
        description: "Submersible pump burned out; 3-acre paddy nursery will dry up if water is not supplied by evening.",
        status: "pending",
        createdAt: Date.now() - 3600000 * 3,
      },
    ];

    matchesStore = [];
    chatsStore = {};
    notificationsStore = [];

    // Trigger auto matches
    executeAutoMatch("food");
    executeAutoMatch("agriculture");

    res.json({ success: true, message: "Demo data seeded and matched successfully!" });
  });

  // Provide Firebase backend files to frontend for inspection / download
  app.get("/api/backend-files", (req, res) => {
    try {
      const functionsCode = fs.readFileSync(path.join(process.cwd(), "firebase/functions/index.js"), "utf8");
      const dbRules = fs.readFileSync(path.join(process.cwd(), "firebase/database.rules.json"), "utf8");
      const firestoreRules = fs.readFileSync(path.join(process.cwd(), "firebase/firestore.rules"), "utf8");

      res.json({
        success: true,
        files: {
          "functions/index.js": functionsCode,
          "database.rules.json": dbRules,
          "firestore.rules": firestoreRules,
        },
      });
    } catch (e: any) {
      res.json({ success: false, error: e.message });
    }
  });

  // Seed initial match on server start for rich demo
  executeAutoMatch("food");
  executeAutoMatch("agriculture");

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vitanex Fusion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
