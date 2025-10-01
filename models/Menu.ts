import mongoose from 'mongoose';

export interface IMenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  isVegetarian: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface IMenu extends mongoose.Document {
  _id: string;
  providerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  items: IMenuItem[];
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new mongoose.Schema<IMenuItem>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages'],
  },
  isVegetarian: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
  },
});

const menuSchema = new mongoose.Schema<IMenu>({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Menu name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  items: [menuItemSchema],
  validFrom: {
    type: Date,
    required: true,
    default: Date.now,
  },
  validTo: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default (mongoose.models.Menu as mongoose.Model<IMenu>) || mongoose.model<IMenu>('Menu', menuSchema);