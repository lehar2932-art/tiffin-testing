"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChefHat,
  User,
  Settings,
  LogOut,
  Heart,
  Package,
  Bell,
  MessageCircle,
  Star,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/dashboard/admin";
      case "provider":
        return "/dashboard/provider";
      case "consumer":
        return "/dashboard/consumer";
      default:
        return "/";
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                TiffinHub
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                TiffinHub
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href={getDashboardLink()}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>

                {user.role === "consumer" && (
                  <>
                    <Link href="/browse-providers">
                      <Button variant="ghost">Browse</Button>
                    </Link>
                    <Link href="/track-orders">
                      <Button variant="ghost">Track Orders</Button>
                    </Link>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <DropdownMenuItem>
                      <Link
                        href="/profile"
                        className="flex items-center w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/settings"
                        className="flex items-center w-full"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/notifications"
                        className="flex items-center w-full"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/help-requests"
                        className="flex items-center w-full"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Help & Support</span>
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === "admin" || user.role === "provider") && (
                      <DropdownMenuItem>
                        <Link
                          href="/reviews"
                          className="flex items-center w-full"
                        >
                          <Star className="mr-2 h-4 w-4" />
                          <span>Reviews</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "consumer" && (
                      <>
                        <DropdownMenuItem>
                          <Link
                            href="/favorites"
                            className="flex items-center w-full"
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            <span>My Favorites</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href="/order-history"
                            className="flex items-center w-full"
                          >
                            <Package className="mr-2 h-4 w-4" />
                            <span>Order History</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
