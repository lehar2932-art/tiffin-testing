"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Search,
  Store,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  MapPin,
  ChefHat,
} from "lucide-react";

interface ServiceProvider {
  _id: string;
  businessName: string;
  description: string;
  cuisine: string[];
  deliveryAreas: string[];
  rating: number;
  totalOrders: number;
  isVerified: boolean;
  isActive: boolean;
  operatingHours: {
    start: string;
    end: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, verificationFilter, statusFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "admin") {
          router.push("/");
          return;
        }
        setUser(data.user);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/admin/providers");
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];

    if (searchTerm) {
      filtered = filtered.filter(
        (provider) =>
          provider.businessName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          provider.userId.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          provider.cuisine.some((c) =>
            c.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (verificationFilter) {
      filtered = filtered.filter((provider) =>
        verificationFilter === "verified"
          ? provider.isVerified
          : !provider.isVerified
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((provider) =>
        statusFilter === "active" ? provider.isActive : !provider.isActive
      );
    }

    setFilteredProviders(filtered);
  };

  const toggleVerification = async (
    providerId: string,
    isVerified: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/admin/providers/${providerId}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isVerified }),
        }
      );

      if (response.ok) {
        setProviders((prev) =>
          prev.map((provider) =>
            provider._id === providerId ? { ...provider, isVerified } : provider
          )
        );
        setMessage(
          `Provider ${isVerified ? "verified" : "unverified"} successfully`
        );
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating provider verification:", error);
      setError("Failed to update provider verification");
      setTimeout(() => setError(""), 3000);
    }
  };

  const toggleStatus = async (providerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/providers/${providerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setProviders((prev) =>
          prev.map((provider) =>
            provider._id === providerId ? { ...provider, isActive } : provider
          )
        );
        setMessage(
          `Provider ${isActive ? "activated" : "deactivated"} successfully`
        );
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating provider status:", error);
      setError("Failed to update provider status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getProviderStats = () => {
    const total = filteredProviders.length;
    const verified = filteredProviders.filter(
      (provider) => provider.isVerified
    ).length;
    const unverified = total - verified;
    const active = filteredProviders.filter(
      (provider) => provider.isActive
    ).length;
    const inactive = total - active;

    return { total, verified, unverified, active, inactive };
  };

  if (loading) return <LoadingPage />;

  const stats = getProviderStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Management
          </h1>
          <p className="text-gray-600">Verify and manage service providers</p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription className="text-green-600">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Providers</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Store className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.verified}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unverified</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.unverified}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.active}
                  </p>
                </div>
                <div className="text-blue-500">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.inactive}
                  </p>
                </div>
                <div className="text-red-500">❌</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={verificationFilter}
                onValueChange={setVerificationFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setVerificationFilter("");
                  setStatusFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Providers List */}
        <div className="space-y-4">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <Card key={provider._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {provider.businessName}
                        </h3>
                        <Badge
                          variant={
                            provider.isVerified ? "default" : "secondary"
                          }
                        >
                          {provider.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge
                          variant={provider.isActive ? "default" : "secondary"}
                        >
                          {provider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        by {provider.userId.name}
                      </p>
                      <p className="text-gray-600 mb-3">
                        {provider.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ChefHat className="h-4 w-4 text-gray-500" />
                            <div className="flex flex-wrap gap-1">
                              {provider.cuisine.slice(0, 3).map((c, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {c}
                                </Badge>
                              ))}
                              {provider.cuisine.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{provider.cuisine.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {provider.deliveryAreas.slice(0, 2).join(", ")}
                              {provider.deliveryAreas.length > 2 &&
                                ` +${provider.deliveryAreas.length - 2} more`}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">
                              {provider.rating.toFixed(1)} rating
                            </span>
                          </div>

                          <p className="text-sm text-gray-600">
                            {provider.totalOrders} orders completed
                          </p>

                          <p className="text-sm text-gray-600">
                            Hours: {provider.operatingHours.start} -{" "}
                            {provider.operatingHours.end}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-500">
                          <strong>Contact:</strong> {provider.userId.email}
                          {provider.userId.phone &&
                            ` • ${provider.userId.phone}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Joined:</strong>{" "}
                          {new Date(provider.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Verified</span>
                        <Switch
                          checked={provider.isVerified}
                          onCheckedChange={(checked) =>
                            toggleVerification(provider._id, checked)
                          }
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm">Active</span>
                        <Switch
                          checked={provider.isActive}
                          onCheckedChange={(checked) =>
                            toggleStatus(provider._id, checked)
                          }
                        />
                      </div>

                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No providers found
              </h3>
              <p className="text-gray-600">
                {searchTerm || verificationFilter || statusFilter
                  ? "Try adjusting your filters"
                  : "No providers registered yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
