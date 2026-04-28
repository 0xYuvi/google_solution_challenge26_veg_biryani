import prisma from "../config/db.js";
import { firebaseAuth } from "../config/firebase-admin.js";

// Sync user
export const syncUserService = async (token) => {
  const auth = firebaseAuth();
  if (!auth) {
    throw new Error('Authentication service unavailable');
  }

  const decoded = await auth.verifyIdToken(token);

  const { uid, email, name, phone_number: phoneNumber, firebase } = decoded;

  const signInProvider = firebase?.sign_in_provider;
  const authProvider =
    signInProvider === "google.com"
      ? "GOOGLE"
      : signInProvider === "phone"
        ? "PHONE"
        : "EMAIL";
  const trimmedName = name?.trim();
  const displayName = trimmedName || email?.split("@")[0] || phoneNumber || "User";

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { providerId: uid },
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phone: phoneNumber }] : [])
      ]
    }
  });

  const payload = {
    ...(trimmedName ? { name: trimmedName } : {}),
    ...(email ? { email } : {}),
    ...(phoneNumber ? { phone: phoneNumber } : {}),
    authProvider,
    providerId: uid
  };

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: payload
    });
  } else {
    user = await prisma.user.create({
      data: {
        name: displayName,
        email,
        phone: phoneNumber,
        authProvider,
        providerId: uid
      }
    });
  }

  return {
    message: "User synced successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      authProvider: user.authProvider,
      trustScore: user.trustScore,
      city: user.city,
      createdAt: user.createdAt
    }
  };
};

// Get current user
export const getMeService = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { volunteerProfile: true }
  });
};

// Update user
export const updateMeService = async (userId, data) => {
  const { name, city, lat, lng } = data;

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(city && { city }),
      ...(lat !== undefined && { lat: parseFloat(lat) }),
      ...(lng !== undefined && { lng: parseFloat(lng) }),
      updatedAt: new Date()
    }
  });
};

// Public profile
export const getUserByIdService = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      trustScore: true,
      city: true,
      createdAt: true,
      volunteerProfile: true
    }
  });
};

// Volunteer profile (UPSERT)
export const upsertVolunteerProfileService = async (userId, data) => {
  const { skills, availability } = data;

  return prisma.volunteerProfile.upsert({
    where: { userId },
    update: { skills, availability },
    create: { userId, skills, availability }
  });
};

// Register FCM device token
export const registerDeviceTokenService = async (userId, token) => {
  return prisma.deviceToken.upsert({
    where: { token },
    update: { userId },
    create: { userId, token }
  });
};

// Trust score history
export const getTrustScoreHistoryService = async (userId) => {
  return prisma.trustScoreLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
};

// Soft delete account
export const deleteMyAccountService = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() }
  });
};
