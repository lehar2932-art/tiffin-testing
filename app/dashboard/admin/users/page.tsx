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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
} from "lucide-react";
import EditUserModal from "./EditUser";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "admin") {
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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((user) =>
        statusFilter === "active" ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isActive } : user
          )
        );
        setMessage(
          `User ${isActive ? "activated" : "deactivated"} successfully`
        );
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update user status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userId));
        setMessage("User deleted successfully");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "provider":
        return "bg-blue-100 text-blue-800";
      case "consumer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserStats = () => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter((user) => user.isActive).length;
    const inactive = total - active;
    const admins = filteredUsers.filter((user) => user.role === "admin").length;
    const providers = filteredUsers.filter(
      (user) => user.role === "provider"
    ).length;
    const consumers = filteredUsers.filter(
      (user) => user.role === "consumer"
    ).length;

    return { total, active, inactive, admins, providers, consumers };
  };

  if (loading) return <LoadingPage />;

  const stats = getUserStats();

  const handleSaveUser = async (data: Partial<User>) => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) =>
          prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
        );
        setMessage("User updated successfully");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage platform users and their permissions
          </p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription className="text-green-600">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.inactive}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Providers</p>
                  <p className="text-2xl font-bold">{stats.providers}</p>
                </div>
                <div className="text-blue-500">🏪</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Consumers</p>
                  <p className="text-2xl font-bold">{stats.consumers}</p>
                </div>
                <div className="text-green-500">👥</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                </SelectContent>
              </Select>

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

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("");
                  setStatusFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card key={user._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </Badge>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{user.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">
                            <strong>Joined:</strong>{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Last Updated:</strong>{" "}
                            {new Date(user.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {user.address && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Address:</strong> {user.address}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Active</span>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={(checked) =>
                            toggleUserStatus(user._id, checked)
                          }
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteUser(user._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter || statusFilter
                  ? "Try adjusting your filters"
                  : "No users registered yet"}
              </p>
            </div>
          )}
        </div>
      </div>
      <EditUserModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
