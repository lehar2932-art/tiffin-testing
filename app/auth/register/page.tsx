"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ChefHat, User, Mail, Lock, Phone, MapPin } from "lucide-react";
import { AuthService } from "@/services/authService";

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "consumer" | "provider";
  phone?: string;
  address?: string;
  businessName?: string;
  description?: string;
  cuisine?: string;
  deliveryAreas?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      role: "consumer",
    },
  });

  const role = watch("role");
  const password = watch("password");

  const onSubmit = async (values: FormValues) => {
    setServerError("");

    if (values.password !== values.confirmPassword) {
      setServerError("Passwords do not match");
      return;
    }

    const payload: any = { ...values };
    if (values.role === "provider") {
      payload.businessData = {
        businessName: values.businessName,
        description: values.description,
        cuisine: values.cuisine
          ? values.cuisine.split(",").map((c) => c.trim())
          : [],
        deliveryAreas: values.deliveryAreas
          ? values.deliveryAreas.split(",").map((a) => a.trim())
          : [],
      };
    }

    try {
      const { user } = await AuthService.signup(payload);

      switch (user.role) {
        case "admin":
          router.push("/dashboard/admin");
          break;
        case "provider":
          router.push("/dashboard/provider");
          break;
        case "consumer":
          router.push("/dashboard/consumer");
          break;
        default:
          router.push("/");
      }
    } catch (err: any) {
      setServerError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ChefHat className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Join TiffinHub</CardTitle>
          <CardDescription>
            Create your account and start your journey
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    className="pl-10"
                    {...register("name", { required: "Name is required" })}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...register("email", { required: "Email is required" })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    {...register("confirmPassword", {
                      required: "Please confirm password",
                      validate: (val) =>
                        val === password || "Passwords do not match",
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumer">
                        Consumer - Order meals
                      </SelectItem>
                      <SelectItem value="provider">
                        Service Provider - Offer tiffin services
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Phone + Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    className="pl-10"
                    {...register("phone")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="Enter your address"
                    className="pl-10"
                    {...register("address")}
                  />
                </div>
              </div>
            </div>

            {/* Business Info if Provider */}
            {role === "provider" && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-lg">Business Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    {...register("businessName", {
                      required: "Business name is required",
                    })}
                  />
                  {errors.businessName && (
                    <p className="text-xs text-red-500">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your tiffin service"
                    {...register("description")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Cuisine Types</Label>
                    <Input
                      id="cuisine"
                      placeholder="e.g., North Indian, South Indian, Chinese"
                      {...register("cuisine")}
                    />
                    <p className="text-xs text-gray-500">
                      Separate multiple cuisines with commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAreas">Delivery Areas</Label>
                    <Input
                      id="deliveryAreas"
                      placeholder="e.g., Koramangala, HSR Layout"
                      {...register("deliveryAreas")}
                    />
                    <p className="text-xs text-gray-500">
                      Separate multiple areas with commas
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
