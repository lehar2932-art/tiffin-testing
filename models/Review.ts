import mongoose from "mongoose";

export interface IReview extends mongoose.Document {
  _id: string;
  consumerId: string;
  providerId: string;
  orderId: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema(
  {
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per order per consumer
reviewSchema.index({ consumerId: 1, orderId: 1 }, { unique: true });

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", reviewSchema);
