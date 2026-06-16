import mongoose, { Schema, Document } from "mongoose";

export interface IShareRecord extends Document {
  userId: mongoose.Types.ObjectId;
  actionType: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW";
  companyName?: string;
  quantity?: number;
  rate?: number;

  grossAmount: number; // Quantity * Rate
  commissionAmount: number; // Broker Fee
  netCashImpact: number; // Exactly how much cash was added or deducted

  status: "COMPLETED" | "PENDING" | "CANCELLED";
  isReversed: boolean;
  reversedReferenceId?: mongoose.Types.ObjectId;

  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShareRecordSchema = new Schema<IShareRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ["BUY", "SELL", "DEPOSIT", "WITHDRAW"],
      required: true,
    },
    companyName: { type: String, uppercase: true, trim: true },

    quantity: { type: Number },
    rate: { type: Number, min: 0 },

    grossAmount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true, default: 0, min: 0 },

    // The most important field for Ledger reconciliation
    netCashImpact: { type: Number, required: true },

    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "CANCELLED"],
      required: true,
      default: "COMPLETED",
    },

    isReversed: { type: Boolean, required: true, default: false },
    reversedReferenceId: { type: Schema.Types.ObjectId, ref: "ShareRecord" },

    transactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

ShareRecordSchema.index({ userId: 1, transactionDate: -1 });

export const ShareRecord =
  mongoose.models.ShareRecord ||
  mongoose.model<IShareRecord>("ShareRecord", ShareRecordSchema);
