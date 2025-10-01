import mongoose, { Schema, Document, Model } from "mongoose";
export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  _id: string;
  consumerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  deliveryAddress: string;
  deliveryDate: Date;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ----------------------- Schemas ----------------------- */
const orderItemSchema = new Schema<IOrderItem>({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new Schema<IOrder>(
  {
    consumerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    deliveryAddress: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", orderSchema);

export default Order;
