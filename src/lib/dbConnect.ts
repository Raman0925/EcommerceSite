import mongoose from "mongoose";

declare global {
  var __mongoose: typeof mongoose | null | undefined;
}

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

const MONGODB_URI: string = mongoUri as string;

let connection = global.__mongoose ?? null;

async function dbConnect(): Promise<typeof mongoose> {
  if (connection && connection.connection.readyState === 1) {
    return connection;
  }

  const options: Parameters<typeof mongoose.connect>[1] = process.env.MONGODB_DB
    ? { dbName: process.env.MONGODB_DB }
    : undefined;

  connection = await mongoose.connect(MONGODB_URI, options);
  global.__mongoose = connection;
  return connection;
}

export default dbConnect;
