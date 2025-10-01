"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import { TPreferences } from "@/app/settings/page";

const Notifications = ({
  preferences,
  handlePreferenceChange,
}: {
  preferences: TPreferences;
  handlePreferenceChange: (key: string, value: any) => void;
}) => {
  return (
    <TabsContent value="notifications" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about orders and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.email}
              onCheckedChange={(checked) =>
                handlePreferenceChange("email", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications via SMS
              </p>
            </div>
            <Switch
              checked={preferences.sms}
              onCheckedChange={(checked) =>
                handlePreferenceChange("sms", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Updates</Label>
              <p className="text-sm text-gray-500">
                Get notified about order status changes
              </p>
            </div>
            <Switch
              checked={preferences.orderUpdates}
              onCheckedChange={(checked) =>
                handlePreferenceChange("orderUpdates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promotional Emails</Label>
              <p className="text-sm text-gray-500">
                Receive offers and promotional content
              </p>
            </div>
            <Switch
              checked={preferences.promotions}
              onCheckedChange={(checked) =>
                handlePreferenceChange("promotions", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-gray-500">
                Weekly summary of your orders and new providers
              </p>
            </div>
            <Switch
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) =>
                handlePreferenceChange("weeklyDigest", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default Notifications;
