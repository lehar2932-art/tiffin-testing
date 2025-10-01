"use client";

import { useEffect, useState } from "react";
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
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
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
        if (data.user.role !== "admin") {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Monitor platform performance and manage operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.totalUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="inline-flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  +12% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Service Providers
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.totalProviders || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="inline-flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  +8% from last month
                </span>
              </p>
            </CardContent>
          </Card>

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
              <p className="text-xs text-muted-foreground">
                <span className="inline-flex items-center">
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  -2% from last month
                </span>
              </p>
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
              <p className="text-xs text-muted-foreground">
                <span className="inline-flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  +15% from last month
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current status of all orders</CardDescription>
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
              <CardDescription>Latest orders on the platform</CardDescription>
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
                        {order.providerId.businessName}
                      </p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.totalAmount}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
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
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/admin/providers">
                    <Store className="mr-2 h-4 w-4" />
                    Verify Providers
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/admin/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Review Orders
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/admin/reports">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Reports
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/reviews">
                    <Star className="mr-2 h-4 w-4" />
                    Manage Reviews
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/help-requests">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Help Requests
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
