import mongoose, { Schema, Document } from "mongoose";

export interface ICompanyHolding extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  totalQuantity: number;

  // Financial Metrics
  avgBuyPrice: number; // (totalInvestedAmount / totalQuantity)
  totalInvestedAmount: number; // Cost Basis: (Gross Buy Amount + Buy Commission)
  realizedProfit: number; // Profit/Loss calculated after deducting Sell Commission

  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyHoldingSchema = new Schema<ICompanyHolding>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyName: { type: String, required: true, uppercase: true, trim: true },

    totalQuantity: { type: Number, default: 0, min: 0 },

    // Average price including commission impact
    avgBuyPrice: { type: Number, default: 0, min: 0 },

    // Total money spent to acquire current holdings (Gross + Commission)
    totalInvestedAmount: { type: Number, default: 0, min: 0 },

    // Actual profit taking home (Net Sell Amount - Proportionate Cost Basis)
    realizedProfit: { type: Number, default: 0 },

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// One user -> One Holding record per company
CompanyHoldingSchema.index({ userId: 1, companyName: 1 }, { unique: true });

export const CompanyHolding =
  mongoose.models.CompanyHolding ||
  mongoose.model<ICompanyHolding>("CompanyHolding", CompanyHoldingSchema);
