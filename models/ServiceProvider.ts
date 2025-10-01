import mongoose from 'mongoose';

export interface IServiceProvider extends mongoose.Document {
  _id: string;
  userId: string;
  businessName: string;
  description?: string;
  cuisine: string[];
  deliveryAreas: string[];
  rating: number;
  totalOrders: number;
  isVerified: boolean;
  isActive: boolean;
  operatingHours: {
    start: string;
    end: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const serviceProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  cuisine: [{
    type: String,
    required: true,
  }],
  deliveryAreas: [{
    type: String,
    required: true,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  operatingHours: {
    start: {
      type: String,
      required: true,
      default: '09:00',
    },
    end: {
      type: String,
      required: true,
      default: '21:00',
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.ServiceProvider || mongoose.model<IServiceProvider>('ServiceProvider', serviceProviderSchema);