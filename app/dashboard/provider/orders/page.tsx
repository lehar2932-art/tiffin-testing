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
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  Eye,
  Phone,
  Mail,
} from "lucide-react";

interface Order {
  _id: string;
  consumerId: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  deliveryAddress: string;
  deliveryDate: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  notes?: string;
}

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "provider") {
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

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.consumerId.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order._id.includes(searchTerm) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (dateFilter) {
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= startDate
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "preparing":
        return <ChefHat className="h-4 w-4" />;
      case "ready":
        return <Package className="h-4 w-4" />;
      case "delivered":
        return <Truck className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderStats = () => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter(
      (order) => order.status === "pending"
    ).length;
    const preparing = filteredOrders.filter(
      (order) => order.status === "preparing"
    ).length;
    const ready = filteredOrders.filter(
      (order) => order.status === "ready"
    ).length;
    const delivered = filteredOrders.filter(
      (order) => order.status === "delivered"
    ).length;

    return { total, pending, preparing, ready, delivered };
  };

  const getTotalRevenue = () => {
    return filteredOrders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((total, order) => total + order.totalAmount, 0);
  };

  if (loading) return <LoadingPage />;

  const stats = getOrderStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage and track your customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Preparing</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.preparing}
                  </p>
                </div>
                <ChefHat className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ready</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.ready}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">
                    ₹{getTotalRevenue().toLocaleString()}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders, customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setDateFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order._id.slice(-8)}
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </div>
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        From {order.consumerId.name} •{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₹{order.totalAmount}</p>
                      <Badge
                        className={getPaymentStatusColor(order.paymentStatus)}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2">Order Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Delivery Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="font-medium mb-2">Customer Details:</h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{order.consumerId.name}</p>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span>{order.consumerId.email}</span>
                        </div>
                        {order.consumerId.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span>{order.consumerId.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Delivery Details:</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Time:</strong>{" "}
                          {new Date(order.deliveryDate).toLocaleTimeString()}
                        </p>
                        <p>
                          <strong>Address:</strong> {order.deliveryAddress}
                        </p>
                        <p>
                          <strong>Payment:</strong> {order.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="pt-2 border-t">
                      <h4 className="font-medium mb-1">
                        Special Instructions:
                      </h4>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}

                  {/* Status Update Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {order.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateOrderStatus(order._id, "confirmed")
                          }
                        >
                          Confirm Order
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateOrderStatus(order._id, "cancelled")
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel Order
                        </Button>
                      </>
                    )}

                    {order.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateOrderStatus(order._id, "preparing")
                        }
                      >
                        Start Preparing
                      </Button>
                    )}

                    {order.status === "preparing" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order._id, "ready")}
                      >
                        Mark Ready
                      </Button>
                    )}

                    {order.status === "ready" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateOrderStatus(order._id, "delivered")
                        }
                      >
                        Mark Delivered
                      </Button>
                    )}

                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter || dateFilter
                  ? "No orders found"
                  : "No orders yet"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter || dateFilter
                  ? "Try adjusting your filters"
                  : "Orders from customers will appear here"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
