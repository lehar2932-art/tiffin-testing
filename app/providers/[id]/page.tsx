"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Star,
  Heart,
  MapPin,
  Clock,
  Plus,
  Minus,
  ShoppingCart,
  Leaf,
  Phone,
  Mail,
} from "lucide-react";

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
}

interface ServiceProvider {
  _id: string;
  businessName: string;
  description: string;
  cuisine: string[];
  deliveryAreas: string[];
  rating: number;
  totalOrders: number;
  isVerified: boolean;
  operatingHours: {
    start: string;
    end: string;
  };
  userId: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function ProviderPage({ params }: { params: { id: string } }) {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderData, setOrderData] = useState({
    deliveryAddress: "",
    deliveryDate: "",
    notes: "",
  });
  const [isOrdering, setIsOrdering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchProvider();
    fetchMenus();
    fetchReviews();
  }, [params.id]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user.role === "consumer") {
          checkFavoriteStatus();
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  const fetchProvider = async () => {
    try {
      const response = await fetch(`/api/providers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProvider(data.provider);
      }
    } catch (error) {
      console.error("Error fetching provider:", error);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await fetch(`/api/menus?providerId=${params.id}`);
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

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?providerId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.favorites.some((fav: any) => fav._id === params.id));
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || user.role !== "consumer") return;

    try {
      if (isFavorite) {
        const response = await fetch(`/api/favorites?providerId=${params.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ providerId: params.id }),
        });
        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem._id === item._id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem._id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((cartItem) =>
          cartItem._id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter((cartItem) => cartItem._id !== itemId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemQuantityInCart = (itemId: string) => {
    const item = cart.find((cartItem) => cartItem._id === itemId);
    return item ? item.quantity : 0;
  };

  const getAllCategories = () => {
    const categories = new Set<string>();
    menus.forEach((menu) => {
      menu.items.forEach((item) => categories.add(item.category));
    });
    return Array.from(categories);
  };

  const getFilteredItems = () => {
    let allItems: MenuItem[] = [];
    menus.forEach((menu) => {
      allItems = [...allItems, ...menu.items];
    });

    if (selectedCategory === "all") {
      return allItems;
    }
    return allItems.filter((item) => item.category === selectedCategory);
  };

  const handlePlaceOrder = async () => {
    if (!user || user.role !== "consumer") {
      router.push("/auth/login");
      return;
    }

    if (cart.length === 0) {
      alert("Please add items to cart");
      return;
    }

    if (!orderData.deliveryAddress || !orderData.deliveryDate) {
      alert("Please fill in delivery details");
      return;
    }

    setIsOrdering(true);

    try {
      // Create Razorpay order
      const razorpayResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: getCartTotal(),
          currency: "INR",
        }),
      });

      const razorpayOrder = await razorpayResponse.json();

      if (!razorpayResponse.ok) {
        throw new Error(razorpayOrder.error);
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "TiffinHub",
        description: `Order from ${provider?.businessName}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          // Verify payment and create order
          const orderResponse = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              providerId: params.id,
              items: cart.map((item) => ({
                menuItemId: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              totalAmount: getCartTotal(),
              deliveryAddress: orderData.deliveryAddress,
              deliveryDate: new Date(orderData.deliveryDate),
              paymentMethod: "razorpay",
              notes: orderData.notes,
              razorpayOrderId: razorpayOrder.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            setCart([]);
            setOrderData({ deliveryAddress: "", deliveryDate: "", notes: "" });
            router.push(`/track-orders`);
          } else {
            alert("Failed to create order");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order");
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) return <LoadingPage />;

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>Provider not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl flex items-center gap-3">
                  {provider.businessName}
                  {provider.isVerified && (
                    <Badge variant="default">Verified</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  by {provider.userId.name}
                </CardDescription>
                <p className="text-gray-600 mt-2">{provider.description}</p>
              </div>
              {user?.role === "consumer" && (
                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  className="ml-4"
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {isFavorite ? "Favorited" : "Add to Favorites"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Cuisine Types</h4>
                <div className="flex flex-wrap gap-1">
                  {provider.cuisine.map((c, i) => (
                    <Badge key={i} variant="secondary">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Delivery Areas</h4>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {provider.deliveryAreas.slice(0, 2).join(", ")}
                    {provider.deliveryAreas.length > 2 &&
                      ` +${provider.deliveryAreas.length - 2} more`}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Operating Hours</h4>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {provider.operatingHours.start} -{" "}
                    {provider.operatingHours.end}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {provider.rating.toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({reviews.length} reviews)
                </span>
              </div>
              <div className="text-gray-500">
                {provider.totalOrders} orders completed
              </div>
              {provider.userId.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{provider.userId.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="menu" className="space-y-6">
              <TabsList>
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({reviews.length})
                </TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="space-y-6">
                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Items
                  </Button>
                  {getAllCategories().map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                  {getFilteredItems().map((item) => (
                    <Card key={item._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{item.name}</h3>
                              {item.isVegetarian && (
                                <Leaf className="h-4 w-4 text-green-500" />
                              )}
                              {!item.isAvailable && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">
                                ₹{item.price}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                          </div>

                          {user?.role === "consumer" && item.isAvailable && (
                            <div className="flex items-center gap-2">
                              {getItemQuantityInCart(item._id) > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromCart(item._id)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-medium min-w-[20px] text-center">
                                    {getItemQuantityInCart(item._id)}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addToCart(item)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                >
                                  Add to Cart
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">
                              {review.consumerId.name}
                            </p>
                            <div className="flex items-center gap-1">
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
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No reviews yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{provider.userId.email}</span>
                    </div>
                    {provider.userId.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{provider.userId.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {provider.deliveryAreas.map((area, i) => (
                        <Badge key={i} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Cart & Order Section */}
          {user?.role === "consumer" && (
            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Your Order ({getCartItemCount()} items)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length > 0 ? (
                    <>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {cart.map((item) => (
                          <div
                            key={item._id}
                            className="flex justify-between items-center py-2 border-b"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                ₹{item.price} each
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item._id)}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(item)}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total:</span>
                          <span>₹{getCartTotal()}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">
                            Delivery Address
                          </label>
                          <Textarea
                            placeholder="Enter your delivery address"
                            value={orderData.deliveryAddress}
                            onChange={(e) =>
                              setOrderData((prev) => ({
                                ...prev,
                                deliveryAddress: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Delivery Date & Time
                          </label>
                          <Input
                            type="datetime-local"
                            value={orderData.deliveryDate}
                            onChange={(e) =>
                              setOrderData((prev) => ({
                                ...prev,
                                deliveryDate: e.target.value,
                              }))
                            }
                            className="mt-1"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Special Instructions (Optional)
                          </label>
                          <Textarea
                            placeholder="Any special requests or notes"
                            value={orderData.notes}
                            onChange={(e) =>
                              setOrderData((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={handlePlaceOrder}
                        disabled={
                          isOrdering ||
                          !orderData.deliveryAddress ||
                          !orderData.deliveryDate
                        }
                      >
                        {isOrdering
                          ? "Processing..."
                          : `Place Order - ₹${getCartTotal()}`}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Your cart is empty</p>
                      <p className="text-sm">Add items from the menu</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
