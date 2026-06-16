import mongoose, { Schema, Document } from "mongoose";

export interface IUserLedger extends Document {
  userId: mongoose.Types.ObjectId;

  cashBalance: number; // Current available money

  totalBuyVolume: number; // Only the Gross Value of shares bought
  totalSellVolume: number; // Only the Gross Value of shares sold

  totalCommissionPaid: number; // Total Commission (Buy Commission + Sell Commission)

  createdAt: Date;
  updatedAt: Date;
}

const UserLedgerSchema = new Schema<IUserLedger>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    cashBalance: { type: Number, default: 0 }, // Can go negative if using margin, otherwise min: 0

    totalBuyVolume: { type: Number, default: 0, min: 0 },
    totalSellVolume: { type: Number, default: 0, min: 0 },

    // A strict record of how much the platform earned from this user
    totalCommissionPaid: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const UserLedger =
  mongoose.models.UserLedger ||
  mongoose.model<IUserLedger>("UserLedger", UserLedgerSchema);
