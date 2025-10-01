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
// import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Search, Star, Trash2, Filter } from "lucide-react";

interface Review {
  _id: string;
  consumerId: {
    name: string;
    email: string;
  };
  providerId: {
    businessName: string;
  };
  orderId: {
    totalAmount: number;
    createdAt: string;
  };
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
}

interface Provider {
  _id: string;
  businessName: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchReviews();
  }, [providerFilter, ratingFilter, sortBy, sortOrder]);

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

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (providerFilter) params.append("providerId", providerFilter);
      if (ratingFilter) params.append("rating", ratingFilter);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("limit", "20");

      const endpoint =
        user?.role === "admin" ? "/api/admin/reviews" : "/api/reviews";
      const response = await fetch(`${endpoint}?${params}`);

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
        if (data.providers) {
          setProviders(data.providers);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId }),
      });

      if (response.ok) {
        setReviews((prev) => prev.filter((review) => review._id !== reviewId));
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true;
    return (
      review.consumerId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.providerId.businessName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === "admin" ? "All Reviews" : "My Reviews"}
          </h1>
          <p className="text-gray-600">
            {user?.role === "admin"
              ? "Manage and monitor all platform reviews"
              : "Reviews from your customers"}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold">{stats.totalReviews}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold">
                      {stats.averageRating.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Rating Distribution</h3>
                <div className="space-y-2">
                  {stats.ratingDistribution.map((item: any) => (
                    <div key={item.rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{item.rating}★</span>
                      {/* <Progress
                        value={(item.count / stats.totalReviews) * 100 || 0}
                        className="flex-1 h-2"
                      /> */}
                      <span className="text-sm text-gray-500 w-8">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {user?.role === "admin" && (
                <Select
                  value={providerFilter}
                  onValueChange={setProviderFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider._id} value={provider._id}>
                        {provider.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setProviderFilter("");
                  setRatingFilter("");
                  setSortBy("createdAt");
                  setSortOrder("desc");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.rating}/5</span>
                        {review.isVerified && (
                          <Badge variant="default" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-medium">
                            {review.consumerId.name}
                          </p>
                          {user?.role === "admin" && (
                            <p className="text-sm text-gray-500">
                              {review.consumerId.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Provider</p>
                          <p className="font-medium">
                            {review.providerId.businessName}
                          </p>
                        </div>
                      </div>

                      {review.comment && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">Comment</p>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Order Amount: ₹{review.orderId.totalAmount}</span>
                        <span>•</span>
                        <span>
                          Reviewed:{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          Order Date:{" "}
                          {new Date(
                            review.orderId.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {user?.role === "admin" && (
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReview(review._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-600">
                {searchTerm || providerFilter || ratingFilter
                  ? "Try adjusting your filters"
                  : "No reviews available yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
