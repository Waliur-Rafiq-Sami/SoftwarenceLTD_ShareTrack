import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITradeRecord extends Document {
  userId: Types.ObjectId;
  instrument: string;
  tradeType: "BUY" | "SELL";
  quantity: number;
  rate: number;
  commission: number;
  amount: number;
  netAmount: number;
  transactionDate: Date;
}

const TradeRecordSchema = new Schema<ITradeRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    instrument: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    tradeType: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
      default: "BUY",
    },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    commission: { type: Number, required: true, default: 0 },
    amount: { type: Number },
    netAmount: { type: Number },
    transactionDate: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

// Auto-calculate exact matching ledger statement formats before database commit
TradeRecordSchema.pre("save", function (next) {
  // 1. Calculate Gross Base Amount
  this.amount = this.quantity * this.rate;

  // 2. Compute true balance impact matching the confirmation slip
  if (this.tradeType === "BUY") {
    // BUY: Costs money + brokerage commission fees (Leaves account -> Negative)
    this.netAmount = -(this.amount + this.commission);
  } else {
    // SELL: Earns money - brokerage commission fees (Enters account -> Positive)
    this.netAmount = this.amount - this.commission;
  }

  next();
});

export const TradeRecord = mongoose.models.TradeRecord || mongoose.model<ITradeRecord>("TradeRecord", TradeRecordSchema);
