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
import { ShoppingBag, DollarSign, Star, Clock, Plus, Eye } from "lucide-react";

export default function ProviderDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchAnalytics();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "provider") {
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

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Provider Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your tiffin service and track performance
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/provider/menu/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Menu
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground">Orders received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(analytics?.totalRevenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Revenue earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">Customer rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.ordersByStatus?.find(
                  (item: any) => item._id === "pending"
                )?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Overview</CardTitle>
              <CardDescription>Current status of your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.ordersByStatus?.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(item._id)}>
                        {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                      </Badge>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentOrders?.slice(0, 5).map((order: any) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{order.consumerId.name}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} items •{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.totalAmount}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </div>
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
              <CardDescription>Manage your tiffin service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/provider/menu">
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Menus
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/provider/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    View Orders
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/reviews">
                    <Star className="mr-2 h-4 w-4" />
                    Customer Reviews
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/provider/analytics">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Analytics
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
