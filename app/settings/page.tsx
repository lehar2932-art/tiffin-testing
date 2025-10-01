"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Settings } from "lucide-react";
import Notifications from "@/components/screens/settings/notifications";
import Preferences from "@/components/screens/settings/preferences";
import Privacy from "@/components/screens/settings/privacy";
import { SettingsService } from "@/services/settingService";
import Account from "@/components/screens/settings/account";
import { TSettings } from "@/types";

export interface TPreferences {
  email: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  weeklyDigest: boolean;
  language: string;
  timezone: string;
  currency: string;
}

export interface TPrivacy {
  profileVisibility: string;
  showOrderHistory: boolean;
  dataCollection: boolean;
  marketing: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [preferences, setPreferences] = useState({
    email: false,
    sms: false,
    orderUpdates: false,
    promotions: false,
    weeklyDigest: false,
    language: "en",
    timezone: "Asia/Kolkata",
    currency: "INR",
  });

  const [provider, setProvider] = useState({
    autoAcceptOrders: true,
    deliveryRadius: 50,
    maxOrdersPerDay: 10,
    preparationTime: 30,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showOrderHistory: false,
    dataCollection: true,
    marketing: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);
  useEffect(() => {
    if (user?.role) {
      loadSettings();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const loadSettings = async () => {
    try {
      const response = await SettingsService.fetchSettings();
      setPreferences({
        ...response.data.notifications,
        ...(response.data.preferences as any),
      });
      if (user?.role === "provider") {
        setProvider(response?.data?.provider as any);
      }

      setPrivacy(response.data.privacy as any);
      setLoading(false);
    } catch (error) {
      console.error("Error loading settings:", error);
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleProviderChange = (key: string, value: any) => {
    setProvider((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const {
        email,
        sms,
        orderUpdates,
        promotions,
        weeklyDigest,
        language,
        timezone,
        currency,
      } = preferences;

      let payload: TSettings = {
        notifications: {
          email,
          sms,
          orderUpdates,
          promotions,
          weeklyDigest,
          push: true,
        },
        preferences: {
          language,
          timezone,
          currency,
        },
        privacy: {
          dataCollection: privacy.dataCollection,
          marketing: privacy.marketing,
          profileVisibility: privacy.profileVisibility,
          showOrderHistory: privacy.showOrderHistory,
        },
      };

      if (user.role === "provider") {
        payload = {
          ...payload,
          provider: {
            autoAcceptOrders: provider.autoAcceptOrders,
            deliveryRadius: provider.deliveryRadius,
            maxOrdersPerDay: provider.maxOrdersPerDay,
            preparationTime: provider.preparationTime,
          },
        };
      }
      await SettingsService.updateSettings(payload);
      setMessage("Settings saved successfully");
      loadSettings();
    } catch (error) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {message && (
            <Alert>
              <AlertDescription className="text-green-600">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Notifications
            preferences={preferences}
            handlePreferenceChange={handlePreferenceChange}
          />
          <Preferences
            preferences={preferences}
            handlePreferenceChange={handlePreferenceChange}
            provider={provider}
            handleProviderChange={handleProviderChange}
            user={user}
          />
          <Privacy
            privacy={privacy}
            handlePrivacyChange={handlePrivacyChange}
          />
          <Account setError={setError} />

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
