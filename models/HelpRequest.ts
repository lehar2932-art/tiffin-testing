import mongoose from "mongoose";

export interface IHelpRequest extends mongoose.Document {
  _id: string;
  fromUserId: string;
  toUserId?: string;
  type: "admin_support" | "provider_support" | "consumer_to_provider";
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "technical" | "billing" | "order" | "account" | "general";
  attachments?: string[];
  responses: Array<{
    userId: string;
    message: string;
    timestamp: Date;
    isAdmin: boolean;
  }>;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const helpRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["admin_support", "provider_support", "consumer_to_provider"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["technical", "billing", "order", "account", "general"],
      default: "general",
    },
    attachments: [
      {
        type: String,
      },
    ],
    responses: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
      },
    ],
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.HelpRequest ||
  mongoose.model<IHelpRequest>("HelpRequest", helpRequestSchema);
