"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Search,
  MapPin,
  Star,
  ChefHat,
  Heart,
  TrendingUp,
  Filter,
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
  userId: {
    name: string;
  };
}

export default function BrowseProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchProviders();
    fetchFavorites();
  }, []);

  useEffect(() => {
    filterAndSortProviders();
  }, [providers, searchTerm, selectedCuisine, selectedArea, sortBy]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/providers?limit=50");
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

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites.map((fav: any) => fav._id));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (providerId: string) => {
    if (!user || user.role !== "consumer") return;

    try {
      const isFavorite = favorites.includes(providerId);

      if (isFavorite) {
        const response = await fetch(
          `/api/favorites?providerId=${providerId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          setFavorites((prev) => prev.filter((id) => id !== providerId));
        }
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ providerId }),
        });
        if (response.ok) {
          setFavorites((prev) => [...prev, providerId]);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const filterAndSortProviders = () => {
    let filtered = [...providers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (provider) =>
          provider.businessName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          provider.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          provider.cuisine.some((c) =>
            c.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by cuisine
    if (selectedCuisine) {
      filtered = filtered.filter((provider) =>
        provider.cuisine.includes(selectedCuisine)
      );
    }

    // Filter by delivery area
    if (selectedArea) {
      filtered = filtered.filter((provider) =>
        provider.deliveryAreas.includes(selectedArea)
      );
    }

    // Sort providers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "orders":
          return b.totalOrders - a.totalOrders;
        case "name":
          return a.businessName.localeCompare(b.businessName);
        default:
          return 0;
      }
    });

    setFilteredProviders(filtered);
  };

  const getAllCuisines = () => {
    const cuisines = new Set<string>();
    providers.forEach((provider) => {
      provider.cuisine.forEach((c) => cuisines.add(c));
    });
    return Array.from(cuisines).sort();
  };

  const getAllAreas = () => {
    const areas = new Set<string>();
    providers.forEach((provider) => {
      provider.deliveryAreas.forEach((a) => areas.add(a));
    });
    return Array.from(areas).sort();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Browse Tiffin Providers
          </h1>
          <p className="text-gray-600">
            Discover delicious home-cooked meals from local providers
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search providers, cuisine, or dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={selectedCuisine}
                onValueChange={(value) =>
                  setSelectedCuisine(value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Cuisines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {getAllCuisines().map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedArea}
                onValueChange={(value) =>
                  setSelectedArea(value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {getAllAreas().map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="orders">Most Popular</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredProviders.length} of {providers.length} providers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Card
              key={provider._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {provider.businessName}
                      {provider.isVerified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>by {provider.userId.name}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {provider.rating.toFixed(1)}
                      </span>
                    </div>
                    {user?.role === "consumer" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(provider._id)}
                        className="p-1"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.includes(provider._id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {provider.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-gray-500" />
                    <div className="flex flex-wrap gap-1">
                      {provider.cuisine.slice(0, 3).map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                      {provider.cuisine.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
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

                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {provider.totalOrders} orders completed
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <Link href={`/providers/${provider._id}`}>
                    <Button className="w-full">View Menu & Order</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
