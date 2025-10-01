import mongoose from 'mongoose';

export interface ISubscription extends mongoose.Document {
  _id: string;
  consumerId: string;
  providerId: string;
  planName: string;
  menuId: string;
  startDate: Date;
  endDate: Date;
  deliveryDays: string[];
  deliveryTime: string;
  totalAmount: number;
  paidAmount: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new mongoose.Schema({
  consumerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  deliveryDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  }],
  deliveryTime: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', subscriptionSchema);