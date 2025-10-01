"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { ShoppingBag, Search, Heart, Clock } from "lucide-react";

export default function ConsumerDashboard() {
  const [orders, setOrders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchOrders();
    fetchProviders();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "consumer") {
          window.location.href = "/";
          return;
        }
        setUser(data.user);
      } else {
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Auth check error:", error);
      window.location.href = "/auth/login";
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/providers?limit=4");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Discover new meals and track your orders
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">Orders placed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  orders.filter(
                    (order: any) =>
                      !["delivered", "cancelled"].includes(order.status)
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Favorite Providers
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Saved favorites</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest meal orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.slice(0, 5).map((order: any) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {order.providerId.businessName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} items •{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.totalAmount}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Track Order
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No orders yet</p>
                    <p className="text-sm">Start by browsing our providers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                Popular tiffin providers in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider: any) => (
                  <div
                    key={provider._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{provider.businessName}</p>
                      <p className="text-sm text-gray-500">
                        {provider.cuisine.slice(0, 2).join(", ")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">
                          ⭐ {provider.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {provider.totalOrders} orders
                        </span>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/providers/${provider._id}`}>View Menu</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                What would you like to do today?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-16"
                  asChild
                >
                  <Link href="/browse-providers">
                    <div className="text-left">
                      <Search className="mb-1 h-5 w-5" />
                      <div>Browse Providers</div>
                    </div>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-16"
                  asChild
                >
                  <Link href="/track-orders">
                    <div className="text-left">
                      <ShoppingBag className="mb-1 h-5 w-5" />
                      <div>Track Orders</div>
                    </div>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-16"
                  asChild
                >
                  <Link href="/favorites">
                    <div className="text-left">
                      <Heart className="mb-1 h-5 w-5" />
                      <div>My Favorites</div>
                    </div>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-16"
                  asChild
                >
                  <Link href="/order-history">
                    <div className="text-left">
                      <Clock className="mb-1 h-5 w-5" />
                      <div>Order History</div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
