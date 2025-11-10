import { Schema, model, models } from "mongoose";

export interface IUser {
  name?: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  image?: string | null;
  emailVerified?: Date | null;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    image: { type: String, default: null },
    emailVerified: { type: Date, default: null },
  },
  { timestamps: true }
);

const UserModel = models.User || model<IUser>("User", UserSchema);

export default UserModel;
