"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { User, Phone, MapPin, Mail, Lock, Store } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      description: "",
      cuisine: "",
      deliveryAreas: "",
      operatingHours: {
        start: "09:00",
        end: "21:00",
      },
    },
  });

  useEffect(() => {
    checkAuth();
    fetchProfile();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);

        reset({
          name: data.profile.user.name || "",
          phone: data.profile.user.phone || "",
          address: data.profile.user.address || "",
          password: "",
          confirmPassword: "",
          businessName: data.profile.serviceProvider?.businessName || "",
          description: data.profile.serviceProvider?.description || "",
          cuisine: data.profile.serviceProvider?.cuisine?.join(", ") || "",
          deliveryAreas:
            data.profile.serviceProvider?.deliveryAreas?.join(", ") || "",
          operatingHours: data.profile.serviceProvider?.operatingHours || {
            start: "09:00",
            end: "21:00",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    setError("");
    setMessage("");

    if (data.password && data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const payload: any = { ...data };

      if (!data.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }

      if (profile.user.role === "provider") {
        payload.serviceProvider = {
          businessName: data.businessName,
          description: data.description,
          cuisine: data.cuisine
            .split(",")
            .map((c: string) => c.trim())
            .filter(Boolean),
          deliveryAreas: data.deliveryAreas
            .split(",")
            .map((a: string) => a.trim())
            .filter(Boolean),
          operatingHours: data.operatingHours,
        };
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully");
        reset({ ...data, password: "", confirmPassword: "" });
        fetchProfile();
      } else {
        setError(resData.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error. Please try again.");
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
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            {profile?.user.role === "provider" && (
              <TabsTrigger value="business">Business Information</TabsTrigger>
            )}
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          {...register("name", {
                            required: "Full name is required",
                          })}
                          className="pl-10"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          value={profile?.user.email}
                          className="pl-10"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                        <Input
                          id="phone"
                          {...register("phone", {
                            required: "Phone number is required",
                            pattern: {
                              value: /^(\+91[\s]?)?[6-9]\d{9}$/,
                              message: "Enter a valid Indian phone number",
                            },
                          })}
                          className="pl-10"
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-500  absolute">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          {...register("address")}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            {...register("password")}
                            className="pl-10"
                            placeholder="Leave blank to keep current"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword", {
                              validate: (val) =>
                                val === watch("password") ||
                                "Passwords do not match",
                            })}
                            className="pl-10"
                            placeholder="Confirm new password"
                          />
                          {errors.confirmPassword && (
                            <p className="text-red-500 text-sm">
                              {errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {profile?.user.role === "provider" && (
              <TabsContent value="business" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>
                      Update your tiffin service details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="businessName"
                          {...register("businessName", {
                            required: "Business name is required",
                          })}
                          className="pl-10"
                        />
                        {errors.businessName && (
                          <p className="text-red-500 text-sm">
                            {errors.businessName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Business Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cuisine">Cuisine Types</Label>
                        <Input
                          id="cuisine"
                          {...register("cuisine")}
                          placeholder="e.g., North Indian, South Indian, Chinese"
                        />
                        <p className="text-xs text-gray-500">
                          Separate multiple cuisines with commas
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryAreas">Delivery Areas</Label>
                        <Input
                          id="deliveryAreas"
                          {...register("deliveryAreas")}
                          placeholder="e.g., Koramangala, HSR Layout"
                        />
                        <p className="text-xs text-gray-500">
                          Separate multiple areas with commas
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="operatingHours.start">
                          Opening Time
                        </Label>
                        <Input
                          type="time"
                          {...register("operatingHours.start")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="operatingHours.end">Closing Time</Label>
                        <Input
                          type="time"
                          {...register("operatingHours.end")}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
