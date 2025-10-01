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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  CreditCard,
  CircleAlert as AlertCircle,
  Gift,
  MessageCircle,
  Star,
  Users,
  Shield,
} from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "promotion";
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchNotifications();
  }, []);

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

  const fetchNotifications = async (unreadOnly = false) => {
    try {
      const response = await fetch(
        `/api/notifications?unreadOnly=${unreadOnly}`
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationIds,
          markAsRead: true,
        }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notificationIds.includes(notification._id)
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAsRead: true,
        }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-white" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-white" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-white" />;
      case "promotion":
        return <Gift className="h-5 w-5 text-white" />;
      case "review":
        return <Star className="h-5 w-5 text-white" />;
      case "help":
        return <MessageCircle className="h-5 w-5 text-white" />;
      case "verification":
        return <Shield className="h-5 w-5 text-white" />;
      default:
        return <Bell className="h-5 w-5 text-white" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case "order":
        return "bg-gradient-to-r from-blue-500 to-blue-600";
      case "payment":
        return "bg-gradient-to-r from-green-500 to-emerald-600";
      case "system":
        return "bg-gradient-to-r from-orange-500 to-red-500";
      case "promotion":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "review":
        return "bg-gradient-to-r from-yellow-500 to-orange-500";
      case "help":
        return "bg-gradient-to-r from-indigo-500 to-purple-500";
      case "verification":
        return "bg-gradient-to-r from-teal-500 to-cyan-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === activeTab);
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-gray-600">
              Stay updated with your orders and account activity
            </p>
          </div>

          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="order">Orders</TabsTrigger>
            <TabsTrigger value="payment">Payments</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="promotion">Offers</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {getFilteredNotifications().length > 0 ? (
              getFilteredNotifications().map((notification) => (
                <Card
                  key={notification._id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    !notification.isRead ? "bg-blue-50 border-blue-200" : ""
                  }`}
                  onClick={() =>
                    !notification.isRead && markAsRead([notification._id])
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 p-2 rounded-full ${getTypeGradient(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${
                                !notification.isRead
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <p
                              className={`text-sm mt-1 ${
                                !notification.isRead
                                  ? "text-gray-700"
                                  : "text-gray-500"
                              }`}
                            >
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Badge
                              className={`${getTypeGradient(
                                notification.type
                              )} text-white`}
                              variant="secondary"
                            >
                              {notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>

                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead([notification._id]);
                              }}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "unread"
                    ? "No unread notifications"
                    : "No notifications"}
                </h3>
                <p className="text-gray-600">
                  {activeTab === "unread"
                    ? "All caught up! Check back later for updates."
                    : "You'll see notifications about your orders and account here."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
