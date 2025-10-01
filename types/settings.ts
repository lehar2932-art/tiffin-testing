export type TSettings = {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    profileVisibility: string; // "public" | "private" | "friends"
    showOrderHistory: boolean;
    dataCollection: boolean;
    marketing: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
  provider?: {
    autoAcceptOrders: boolean;
    maxOrdersPerDay: number;
    preparationTime: number;
    deliveryRadius: number;
  };
};

export type TProvider = TSettings["provider"];
export type TNotifications = TSettings["notifications"];
