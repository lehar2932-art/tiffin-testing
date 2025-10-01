"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Leaf } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isVegetarian: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

interface Menu {
  _id: string;
  name: string;
  description?: string;
  items: MenuItem[];
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
}

export default function ProviderMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchMenus();
  }, []);

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

  const fetchMenus = async () => {
    try {
      const response = await fetch("/api/menus");
      if (response.ok) {
        const data = await response.json();
        setMenus(data.menus);
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenuStatus = async (menuId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setMenus((prev) =>
          prev.map((menu) =>
            menu._id === menuId ? { ...menu, isActive } : menu
          )
        );
      }
    } catch (error) {
      console.error("Error updating menu status:", error);
    }
  };

  const toggleItemAvailability = async (
    menuId: string,
    itemId: string,
    isAvailable: boolean
  ) => {
    try {
      const response = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable }),
      });

      if (response.ok) {
        setMenus((prev) =>
          prev.map((menu) =>
            menu._id === menuId
              ? {
                  ...menu,
                  items: menu.items.map((item) =>
                    item._id === itemId ? { ...item, isAvailable } : item
                  ),
                }
              : menu
          )
        );
      }
    } catch (error) {
      console.error("Error updating item availability:", error);
    }
  };

  const deleteMenu = async (menuId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this menu? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMenus((prev) => prev.filter((menu) => menu._id !== menuId));
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };

  const getFilteredMenus = () => {
    return menus.filter((menu) => {
      const matchesSearch =
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "" ||
        (statusFilter === "active" && menu.isActive) ||
        (statusFilter === "inactive" && !menu.isActive);

      const matchesCategory =
        categoryFilter === "" ||
        menu.items.some((item) => item.category === categoryFilter);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  };

  const getAllCategories = () => {
    const categories = new Set<string>();
    menus.forEach((menu) => {
      menu.items.forEach((item) => categories.add(item.category));
    });
    return Array.from(categories);
  };

  const getTotalItems = () => {
    return menus.reduce((total, menu) => total + menu.items.length, 0);
  };

  const getActiveMenus = () => {
    return menus.filter((menu) => menu.isActive).length;
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Menu Management
            </h1>
            <p className="text-gray-600">
              Create and manage your tiffin service menus
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/provider/menu/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Menu
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Menus</p>
                  <p className="text-2xl font-bold">{menus.length}</p>
                </div>
                <div className="text-blue-500">📋</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Menus</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getActiveMenus()}
                  </p>
                </div>
                <div className="text-green-500">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{getTotalItems()}</p>
                </div>
                <div className="text-purple-500">🍽️</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Menus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search menus or items..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getAllCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                  setStatusFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Menus List */}
        <div className="space-y-6">
          {getFilteredMenus().length > 0 ? (
            getFilteredMenus().map((menu) => (
              <Card key={menu._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {menu.name}
                        <Badge
                          variant={menu.isActive ? "default" : "secondary"}
                        >
                          {menu.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {menu.description || "No description provided"}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>
                          Valid: {new Date(menu.validFrom).toLocaleDateString()}{" "}
                          - {new Date(menu.validTo).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{menu.items.length} items</span>
                        <span>•</span>
                        <span>
                          Created:{" "}
                          {new Date(menu.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Active</span>
                        <Switch
                          checked={menu.isActive}
                          onCheckedChange={(checked) =>
                            toggleMenuStatus(menu._id, checked)
                          }
                        />
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/provider/menu/${menu._id}/edit`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMenu(menu._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium">Menu Items:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {menu.items.map((item) => (
                        <div key={item._id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm">
                                  {item.name}
                                </h5>
                                {item.isVegetarian && (
                                  <Leaf className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.description || "No description"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-sm">
                                  ₹{item.price}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleItemAvailability(
                                    menu._id,
                                    item._id,
                                    !item.isAvailable
                                  )
                                }
                                className="p-1"
                              >
                                {item.isAvailable ? (
                                  <Eye className="h-3 w-3 text-green-500" />
                                ) : (
                                  <EyeOff className="h-3 w-3 text-red-500" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <Badge
                              variant={
                                item.isAvailable ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {item.isAvailable ? "Available" : "Out of Stock"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || categoryFilter || statusFilter
                  ? "No menus found"
                  : "No menus created yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter || statusFilter
                  ? "Try adjusting your filters"
                  : "Create your first menu to start offering your tiffin services"}
              </p>
              {!searchTerm && !categoryFilter && !statusFilter && (
                <Button asChild>
                  <Link href="/dashboard/provider/menu/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Menu
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
