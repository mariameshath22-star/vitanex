/**
 * Vitanex Fusion - Firebase Cloud Functions Backend Engine
 * Handles real-time auto-matching between Service Providers and Service Receivers,
 * triggers Firebase Cloud Messaging (FCM) push notifications, and establishes
 * secure Realtime Database connection records.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.database();
const messaging = admin.messaging();

/**
 * Haversine formula to compute distance in Kilometers between two coordinates
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
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

/**
 * Trigger: When a Provider posts availability under /providers/{category}/{providerId}
 * Checks for unmatched pending receivers in the same category within proximity.
 */
exports.onProviderCreated = functions.database
  .ref("/providers/{category}/{providerId}")
  .onCreate(async (snapshot, context) => {
    const { category, providerId } = context.params;
    const provider = snapshot.val();

    if (!provider || provider.status !== "active") return null;

    console.log(`[Vitanex Fusion] New Provider registered under category: ${category} by ${provider.name}`);

    // Query pending receivers in the same category
    const receiversSnapshot = await db
      .ref(`/receivers/${category}`)
      .orderByChild("status")
      .equalTo("pending")
      .once("value");

    const receivers = receiversSnapshot.val();
    if (!receivers) {
      console.log(`No pending receivers in category ${category} at this time.`);
      return null;
    }

    // Find closest receiver (within 35 km)
    let bestMatch = null;
    let shortestDistance = Infinity;

    for (const [receiverId, receiver] of Object.entries(receivers)) {
      if (receiver.status !== "pending") continue;

      let distance = 5.0; // fallback default
      if (provider.coordinates && receiver.coordinates) {
        distance = getDistanceKm(
          provider.coordinates.lat,
          provider.coordinates.lng,
          receiver.coordinates.lat,
          receiver.coordinates.lng
        );
      } else if (
        provider.location &&
        receiver.location &&
        provider.location.toLowerCase().trim() === receiver.location.toLowerCase().trim()
      ) {
        distance = 1.2;
      }

      if (distance <= 35 && distance < shortestDistance) {
        shortestDistance = distance;
        bestMatch = { receiverId, receiver, distance };
      }
    }

    if (bestMatch) {
      await createMatchRecord(category, providerId, provider, bestMatch.receiverId, bestMatch.receiver, bestMatch.distance);
    }

    return null;
  });

/**
 * Trigger: When a Receiver posts requirement under /receivers/{category}/{receiverId}
 * Checks for active providers in the same category within proximity.
 */
exports.onReceiverCreated = functions.database
  .ref("/receivers/{category}/{receiverId}")
  .onCreate(async (snapshot, context) => {
    const { category, receiverId } = context.params;
    const receiver = snapshot.val();

    if (!receiver || receiver.status !== "pending") return null;

    console.log(`[Vitanex Fusion] New Receiver request submitted under category: ${category} by ${receiver.name}`);

    // Query active providers in the same category
    const providersSnapshot = await db
      .ref(`/providers/${category}`)
      .orderByChild("status")
      .equalTo("active")
      .once("value");

    const providers = providersSnapshot.val();
    if (!providers) {
      console.log(`No active providers in category ${category} right now. Listening for new providers...`);
      return null;
    }

    // Find closest provider (within 35 km)
    let bestMatch = null;
    let shortestDistance = Infinity;

    for (const [providerId, provider] of Object.entries(providers)) {
      if (provider.status !== "active") continue;

      let distance = 5.0;
      if (provider.coordinates && receiver.coordinates) {
        distance = getDistanceKm(
          provider.coordinates.lat,
          provider.coordinates.lng,
          receiver.coordinates.lat,
          receiver.coordinates.lng
        );
      } else if (
        provider.location &&
        receiver.location &&
        provider.location.toLowerCase().trim() === receiver.location.toLowerCase().trim()
      ) {
        distance = 1.2;
      }

      if (distance <= 35 && distance < shortestDistance) {
        shortestDistance = distance;
        bestMatch = { providerId, provider, distance };
      }
    }

    if (bestMatch) {
      await createMatchRecord(category, bestMatch.providerId, bestMatch.provider, receiverId, receiver, bestMatch.distance);
    }

    return null;
  });

/**
 * Creates match record, updates statuses to 'matched', and dispatches FCM notifications
 */
async function createMatchRecord(category, providerId, provider, receiverId, receiver, distanceKm) {
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const matchData = {
    id: matchId,
    category,
    providerId,
    receiverId,
    providerName: provider.name,
    providerPhone: provider.phone,
    receiverName: receiver.name,
    receiverPhone: receiver.phone,
    location: receiver.location || provider.location,
    distanceKm: distanceKm,
    providerOffer: provider.subCategory || provider.description,
    receiverRequirement: receiver.requirement || receiver.description,
    matchedAt: admin.database.ServerValue.TIMESTAMP,
    status: "connected",
  };

  const updates = {};
  updates[`/matches/${matchId}`] = matchData;
  updates[`/providers/${category}/${providerId}/status`] = "matched";
  updates[`/receivers/${category}/${receiverId}/status`] = "matched";

  // Add notification records
  const notifProviderId = `notif_p_${Date.now()}`;
  const notifReceiverId = `notif_r_${Date.now()}`;

  updates[`/notifications/${notifProviderId}`] = {
    id: notifProviderId,
    recipientRole: "provider",
    recipientName: provider.name,
    recipientPhone: provider.phone,
    title: `Match Connected: ${receiver.name} needs help!`,
    message: `A receiver within ${distanceKm} km requires: "${receiver.requirement || receiver.description}". Click to connect or chat.`,
    matchId,
    category,
    timestamp: admin.database.ServerValue.TIMESTAMP,
    read: false,
  };

  updates[`/notifications/${notifReceiverId}`] = {
    id: notifReceiverId,
    recipientRole: "receiver",
    recipientName: receiver.name,
    recipientPhone: receiver.phone,
    title: `Helper Found: ${provider.name} is available!`,
    message: `A service provider offering "${provider.subCategory || provider.description}" is ${distanceKm} km away. Click to view contact details.`,
    matchId,
    category,
    timestamp: admin.database.ServerValue.TIMESTAMP,
    read: false,
  };

  // Seed initial welcome system message in chat
  updates[`/chats/${matchId}/msg_welcome`] = {
    id: "msg_welcome",
    matchId,
    senderId: "system",
    senderName: "Vitanex Fusion Auto-Matcher",
    senderRole: "system",
    text: `🤝 Match Confirmed! ${provider.name} and ${receiver.name} are now connected. You can coordinate supplies, timing, or emergency assistance right here.`,
    timestamp: admin.database.ServerValue.TIMESTAMP,
  };

  await db.ref().update(updates);
  console.log(`[Vitanex Fusion] Successfully established match ${matchId} between ${provider.name} and ${receiver.name}`);

  // Send FCM Notifications if device tokens exist
  if (provider.fcmToken) {
    try {
      await messaging.send({
        token: provider.fcmToken,
        notification: {
          title: "Vitanex Fusion - Help Request Matched!",
          body: `Receiver ${receiver.name} (${distanceKm} km away) is waiting for your ${category} assistance.`,
        },
        data: { matchId, category, action: "open_chat" },
      });
    } catch (e) {
      console.warn("FCM error sending to provider:", e.message);
    }
  }

  if (receiver.fcmToken) {
    try {
      await messaging.send({
        token: receiver.fcmToken,
        notification: {
          title: "Vitanex Fusion - Provider Matched!",
          body: `Helper ${provider.name} (${distanceKm} km away) is available for your request.`,
        },
        data: { matchId, category, action: "open_chat" },
      });
    } catch (e) {
      console.warn("FCM error sending to receiver:", e.message);
    }
  }
}
