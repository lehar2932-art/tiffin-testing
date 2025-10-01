"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Download,
} from "lucide-react";

interface ReportData {
  ordersByMonth: Array<{ month: string; orders: number; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number; percentage: number }>;
  topProviders: Array<{ name: string; orders: number; revenue: number }>;
  userGrowth: Array<{
    month: string;
    users: number;
    providers: number;
    consumers: number;
  }>;
  revenueMetrics: {
    totalRevenue: number;
    monthlyGrowth: number;
    averageOrderValue: number;
    totalOrders: number;
  };
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("6months");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchReportData();
  }, [dateRange]);

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

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/admin/reports?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data.reports);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: "csv" | "pdf") => {
    try {
      const response = await fetch(
        `/api/admin/reports/export?format=${format}&range=${dateRange}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tiffinhub-report-${dateRange}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  if (loading) return <LoadingPage />;

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No Report Data Available
            </h1>
            <p className="text-gray-600">
              Unable to load report data at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics & Reports
            </h1>
            <p className="text-gray-600">
              Comprehensive platform performance insights
            </p>
          </div>

          <div className="flex gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => exportReport("csv")}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>

            <Button variant="outline" onClick={() => exportReport("pdf")}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{reportData.revenueMetrics.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {reportData.revenueMetrics.monthlyGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                {Math.abs(reportData.revenueMetrics.monthlyGrowth)}% from last
                month
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
                {reportData.revenueMetrics.totalOrders.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Orders processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Order Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{reportData.revenueMetrics.averageOrderValue.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Per order average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Providers
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.topProviders.length}
              </div>
              <p className="text-xs text-muted-foreground">Service providers</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Orders & Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Orders & Revenue Trend</CardTitle>
              <CardDescription>Monthly performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.ordersByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="orders"
                    fill="#3B82F6"
                    name="Orders"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Revenue (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current order status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) =>
                      `${status} (${percentage}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData.ordersByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Providers</CardTitle>
              <CardDescription>
                Providers by order volume and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topProviders.slice(0, 5).map((provider, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-gray-500">
                        {provider.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ₹{provider.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>
                Platform user acquisition over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="providers"
                    stackId="a"
                    fill="#3B82F6"
                    name="Providers"
                  />
                  <Bar
                    dataKey="consumers"
                    stackId="a"
                    fill="#10B981"
                    name="Consumers"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
