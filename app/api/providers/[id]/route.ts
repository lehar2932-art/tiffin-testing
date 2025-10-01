import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ServiceProvider from '@/models/ServiceProvider';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    
    const provider = await ServiceProvider.findById(params.id)
      .populate('userId', 'name email phone address');
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ provider });
  } catch (error) {
    console.error('Get provider error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}