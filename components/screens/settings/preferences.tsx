"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { TPreferences } from "@/app/settings/page";
import { TProvider } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { IUser } from "@/models/User";

const Preferences = ({
  preferences,
  handlePreferenceChange,
  provider,
  handleProviderChange,
  user,
}: {
  preferences: TPreferences;
  handlePreferenceChange: (key: string, value: any) => void;
  provider: TProvider | null;
  handleProviderChange: (key: string, value: any) => void;
  user: IUser;
}) => {
  return (
    <TabsContent value="preferences" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Preferences</CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) =>
                  handlePreferenceChange("language", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="kn">Kannada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) =>
                  handlePreferenceChange("timezone", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">
                    India Standard Time
                  </SelectItem>
                  <SelectItem value="Asia/Dubai">Gulf Standard Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={preferences.currency}
              onValueChange={(value) =>
                handlePreferenceChange("currency", value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {user && user?.role === "provider" && (
            <>
              <div className="flex items-center justify-between">
                <Label>Accept orders automatically</Label>
                <Switch
                  checked={provider?.autoAcceptOrders}
                  onCheckedChange={(checked) =>
                    handleProviderChange("autoAcceptOrders", checked)
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxOrdersPerDay">Max orders per day</Label>
                  <Input
                    name="maxOrdersPerDay"
                    value={provider?.maxOrdersPerDay}
                    type="number"
                    min={1}
                    onChange={(e) => {
                      handleProviderChange("maxOrdersPerDay", e.target.value);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preparationTime">
                    Preparation Time (in minutes)
                  </Label>
                  <Input
                    name="preparationTime"
                    value={provider?.preparationTime}
                    type="number"
                    min={0}
                    onChange={(e) =>
                      handleProviderChange("preparationTime", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryRadius">
                    Delivery Radius (in Kilometers)
                  </Label>
                  <Input
                    value={provider?.deliveryRadius}
                    type="number"
                    min={0}
                    onChange={(e) =>
                      handleProviderChange("deliveryRadius", e.target.value)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default Preferences;
