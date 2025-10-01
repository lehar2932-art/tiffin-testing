import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "promotion";
  isRead: boolean;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["order", "payment", "system", "promotion"],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);
