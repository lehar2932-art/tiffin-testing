"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { TProvider } from "@/types";
import { TPrivacy } from "@/app/settings/page";

const Privacy = ({
  privacy,
  handlePrivacyChange,
}: {
  privacy: TPrivacy;
  handlePrivacyChange: (key: string, value: any) => void;
}) => {
  return (
    <TabsContent value="privacy" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profileVisibility">Profile Visibility</Label>
            <Select
              value={privacy.profileVisibility}
              onValueChange={(value) =>
                handlePrivacyChange("profileVisibility", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Control who can see your profile information
            </p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Order History</Label>
              <p className="text-sm text-gray-500">
                Allow others to see your order history
              </p>
            </div>
            <Switch
              checked={privacy.showOrderHistory}
              onCheckedChange={(checked) =>
                handlePrivacyChange("showOrderHistory", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Data Collection</Label>
              <p className="text-sm text-gray-500">
                Help improve our service by sharing usage data
              </p>
            </div>
            <Switch
              checked={privacy.dataCollection}
              onCheckedChange={(checked) =>
                handlePrivacyChange("dataCollection", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Consent</Label>
              <p className="text-sm text-gray-500">
                Allow us to use your data for marketing purposes
              </p>
            </div>
            <Switch
              checked={privacy.marketing}
              onCheckedChange={(checked) =>
                handlePrivacyChange("marketing", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default Privacy;
