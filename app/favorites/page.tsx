"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Heart, Star, ChefHat, MapPin, TrendingUp, Trash2 } from "lucide-react";

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

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchFavorites();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "consumer") {
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

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (providerId: string) => {
    try {
      const response = await fetch(`/api/favorites?providerId=${providerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((fav) => fav._id !== providerId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            My Favorite Providers
          </h1>
          <p className="text-gray-600">
            Your saved tiffin providers for quick access
          </p>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((provider) => (
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
                      <CardDescription>
                        by {provider.userId.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {provider.rating.toFixed(1)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(provider._id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
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

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/providers/${provider._id}`}
                      className="flex-1"
                    >
                      <Button className="w-full">View Menu</Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFavorite(provider._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring providers and add them to your favorites for quick
              access
            </p>
            <Button asChild>
              <Link href="/browse-providers">Browse Providers</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
