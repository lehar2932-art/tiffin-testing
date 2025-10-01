"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  Eye,
} from "lucide-react";

interface Order {
  _id: string;
  providerId: {
    businessName: string;
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
  createdAt: string;
  notes?: string;
}

export default function TrackOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
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

    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
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

  const getOrderProgress = (status: string) => {
    const statuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
    ];
    const currentIndex = statuses.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Track Your Orders
          </h1>
          <p className="text-gray-600">
            Monitor the status of your meal orders in real-time
          </p>
        </div>

        {/* Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
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
                        From {order.providerId.businessName} •{" "}
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
                  {/* Progress Bar */}
                  {!["cancelled", "delivered"].includes(order.status) && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Order Progress</span>
                        <span>
                          {Math.round(getOrderProgress(order.status))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getOrderProgress(order.status)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

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

                  {/* Delivery Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="font-medium mb-1">Delivery Address:</h4>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Delivery Date:</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.deliveryDate).toLocaleDateString()} at{" "}
                        {new Date(order.deliveryDate).toLocaleTimeString()}
                      </p>
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

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {order.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel Order
                      </Button>
                    )}
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter
                  ? `No ${statusFilter} orders found`
                  : "No orders found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {statusFilter ? "Try changing the filter or" : ""} Start by
                browsing our providers
              </p>
              <Button asChild>
                <a href="/browse-providers">Browse Providers</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
