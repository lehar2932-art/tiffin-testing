export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ServiceProvider from '@/models/ServiceProvider';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const cuisine = searchParams.get('cuisine');
    const area = searchParams.get('area');
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = { isActive: true };
    if (cuisine) query.cuisine = { $in: [cuisine] };
    if (area) query.deliveryAreas = { $in: [area] };
    
    const providers = await ServiceProvider.find(query)
      .populate('userId', 'name email phone')
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1, totalOrders: -1 });
    
    const total = await ServiceProvider.countDocuments(query);
    
    return NextResponse.json({
      providers,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: providers.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error('Get providers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}