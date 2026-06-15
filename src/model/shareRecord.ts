import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITradeEntry {
  instrument: string;
  tradeType: "BUY" | "SELL";
  quantity: number;
  rate: number;
  commission: number;
  amount: number;
  netAmount: number;
  transactionDate: Date;
}

export interface ICompanyTrades {
  companyName: string;
  trades: ITradeEntry[];
}

export interface IShareRecord extends Document {
  userId: Types.ObjectId;
  companies: ICompanyTrades[];
}

const TradeEntrySchema = new Schema<ITradeEntry>(
  {
    instrument: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    tradeType: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    commission: {
      type: Number,
      required: true,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: true,
  },
);

TradeEntrySchema.pre("save", function (next) {
  this.amount = this.quantity * this.rate;

  if (this.tradeType === "BUY") {
    this.netAmount = -(this.amount + this.commission);
  } else {
    this.netAmount = this.amount - this.commission;
  }

  next();
});

const CompanyTradesSchema = new Schema<ICompanyTrades>(
  {
    companyName: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    trades: [TradeEntrySchema],
  },
  { _id: false },
);

const ShareRecordSchema = new Schema<IShareRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    companies: {
      type: [CompanyTradesSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const ShareRecord = mongoose.models.ShareRecord || mongoose.model<IShareRecord>("ShareRecord", ShareRecordSchema);

/**
//*----------------- format----------------
{
  "_id": "...",
  "userId": "...",
  "companies": {
    "A": [
      { ...trade1 },
      { ...trade2 },
      { ...trade3 }
    ],
    "B": [
      { ...trade1 },
      { ...trade2 }
    ],
    "GP": [
      { ...trade1 }
    ]
  }
}
//*----------------- example----------------
 {
  "_id": "66a299f459955413cc89ee321",
  "userId": "66a2984e59955413cc89ee30a",
  "companies": [
    {
      "companyName": "A",
      "trades": [
        {
          "instrument": "DFSFDS",
          "tradeType": "BUY",
          "quantity": 10,
          "rate": 10,
          "commission": 10,
          "amount": 100,
          "netAmount": -110,
          "transactionDate": "2026-06-04T00:00:00.000Z"
        }
      ]
    },
    {
      "companyName": "B",
      "trades": [
        {
          "instrument": "ABC",
          "tradeType": "SELL",
          "quantity": 20,
          "rate": 50,
          "commission": 20,
          "amount": 1000,
          "netAmount": 980,
          "transactionDate": "2026-06-05T00:00:00.000Z"
        }
      ]
    }
  ]
}
*/
