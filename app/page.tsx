"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import { ChefHat, Clock, MapPin, Star, Users, TrendingUp } from 'lucide-react';

interface ServiceProvider {
  _id: string;
  businessName: string;
  description: string;
  cuisine: string[];
  deliveryAreas: string[];
  rating: number;
  totalOrders: number;
  isVerified: boolean;
  userId: {
    name: string;
  };
}

export default function HomePage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchProviders();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Redirect to appropriate dashboard if already logged in
        if (data.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (data.user.role === 'provider') {
          router.push('/dashboard/provider');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers?limit=6');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fresh, Home-Cooked
              <br />
              <span className="text-yellow-300">Tiffin Services</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect with local tiffin providers and enjoy delicious, healthy meals delivered to your doorstep
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TiffinHub?</h2>
            <p className="text-xl text-gray-600">Experience the best of home-cooked meals with our platform</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Food</h3>
              <p className="text-gray-600">Fresh, home-cooked meals prepared by verified local tiffin providers</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Timely Delivery</h3>
              <p className="text-gray-600">Reliable delivery schedules that fit your daily routine</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Network</h3>
              <p className="text-gray-600">Verified providers with ratings and reviews from real customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Tiffin Providers</h2>
            <p className="text-xl text-gray-600">Discover popular providers in your area</p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Card key={provider._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {provider.businessName}
                          {provider.isVerified && (
                            <Badge variant="default" className="text-xs">Verified</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>by {provider.userId.name}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{provider.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {provider.cuisine.slice(0, 3).map((c, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                          ))}
                          {provider.cuisine.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{provider.cuisine.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {provider.deliveryAreas.slice(0, 2).join(', ')}
                          {provider.deliveryAreas.length > 2 && ` +${provider.deliveryAreas.length - 2} more`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{provider.totalOrders} orders completed</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      {user?.role === 'consumer' ? (
                        <Link href={`/providers/${provider._id}`}>
                          <Button className="w-full">View Menu</Button>
                        </Link>
                      ) : (
                        <Link href="/auth/register">
                          <Button className="w-full">Sign Up to Order</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of happy customers and providers on TiffinHub
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Join as Consumer
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Become a Provider
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <ChefHat className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">TiffinHub</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 TiffinHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}