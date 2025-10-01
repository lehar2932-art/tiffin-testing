import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "provider" | "consumer";
  phone?: string;
  address?: string;
  isActive: boolean;
  favorites?: string[];
  settings?: any;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "provider", "consumer"],
      default: "consumer",
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
      },
    ],
    tokenVersion: {
      type: Number,
      default: 0,
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
