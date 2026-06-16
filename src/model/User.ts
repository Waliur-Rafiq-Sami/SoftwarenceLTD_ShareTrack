import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  phoneNumber: string;
  address: string;
  profession?: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
}

const UserSchema: Schema<User> = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  profession: {
    type: String,
    required: false,
    trim: true,
  },
  verifyCode: {
    type: String,
    required: [true, "Verify Code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify Code Expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

UserSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: { isVerified: true },
  },
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

if (mongoose.connection.readyState === 1) {
  UserModel.collection
    .dropIndex("username_1")
    .then(() =>
      console.log(
        "[Database] Stale username unique index dropped successfully.",
      ),
    )
    .catch(() => {});
} else {
  mongoose.connection.once("open", () => {
    UserModel.collection
      .dropIndex("username_1")
      .then(() =>
        console.log(
          "[Database] Stale username unique index dropped after connection open.",
        ),
      )
      .catch(() => {});
  });
}

export default UserModel;
