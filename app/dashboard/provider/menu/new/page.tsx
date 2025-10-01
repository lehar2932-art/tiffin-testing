"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  isVegetarian: boolean;
  isAvailable: boolean;
}

export default function NewMenuPage() {
  const [menuData, setMenuData] = useState({
    name: "",
    description: "",
    validFrom: "",
    validTo: "",
    isActive: true,
  });

  const [items, setItems] = useState<MenuItem[]>([
    {
      name: "",
      description: "",
      price: 0,
      category: "lunch",
      isVegetarian: false,
      isAvailable: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const categories = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snacks", label: "Snacks" },
    { value: "beverages", label: "Beverages" },
  ];

  const handleMenuDataChange = (field: string, value: any) => {
    setMenuData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        price: 0,
        category: "lunch",
        isVegetarian: false,
        isAvailable: true,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!menuData.name.trim()) {
      setError("Menu name is required");
      return false;
    }

    if (!menuData.validFrom || !menuData.validTo) {
      setError("Valid from and valid to dates are required");
      return false;
    }

    if (new Date(menuData.validFrom) >= new Date(menuData.validTo)) {
      setError("Valid to date must be after valid from date");
      return false;
    }

    const validItems = items.filter(
      (item) => item.name.trim() && item.price > 0
    );
    if (validItems.length === 0) {
      setError("At least one valid item is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const validItems = items.filter(
        (item) => item.name.trim() && item.price > 0
      );

      const response = await fetch("/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...menuData,
          items: validItems,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Menu created successfully!");
        setTimeout(() => {
          router.push("/dashboard/provider/menu");
        }, 2000);
      } else {
        setError(data.error || "Failed to create menu");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Menu
            </h1>
            <p className="text-gray-600">
              Add a new menu with items for your tiffin service
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-600">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Menu Details */}
          <Card>
            <CardHeader>
              <CardTitle>Menu Details</CardTitle>
              <CardDescription>
                Basic information about your menu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Menu Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Weekly Lunch Menu"
                    value={menuData.name}
                    onChange={(e) =>
                      handleMenuDataChange("name", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={menuData.isActive}
                      onCheckedChange={(checked) =>
                        handleMenuDataChange("isActive", checked)
                      }
                    />
                    <Label htmlFor="isActive">
                      {menuData.isActive ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your menu offerings"
                  value={menuData.description}
                  onChange={(e) =>
                    handleMenuDataChange("description", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={menuData.validFrom}
                    onChange={(e) =>
                      handleMenuDataChange("validFrom", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validTo">Valid To *</Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={menuData.validTo}
                    onChange={(e) =>
                      handleMenuDataChange("validTo", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Menu Items</CardTitle>
                  <CardDescription>Add items to your menu</CardDescription>
                </div>
                <Button type="button" onClick={addItem} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item #{index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Item Name *</Label>
                      <Input
                        placeholder="e.g., Chicken Biryani"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={item.price || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the item"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={item.category}
                        onValueChange={(value) =>
                          handleItemChange(index, "category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Vegetarian</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={item.isVegetarian}
                          onCheckedChange={(checked) =>
                            handleItemChange(index, "isVegetarian", checked)
                          }
                        />
                        <Label>{item.isVegetarian ? "Yes" : "No"}</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Available</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={(checked) =>
                            handleItemChange(index, "isAvailable", checked)
                          }
                        />
                        <Label>{item.isAvailable ? "Yes" : "No"}</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Menu
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
