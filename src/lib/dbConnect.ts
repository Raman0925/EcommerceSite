import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConnection:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

const MONGODB_URI: string = mongoUri as string;

let cached = global.__mongooseConnection;

if (!cached) {
  cached = global.__mongooseConnection = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const options: Parameters<typeof mongoose.connect>[1] = {};
    if (process.env.MONGODB_DB) {
      (options as any).dbName = process.env.MONGODB_DB as string;
    }
    cached!.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongooseInstance) => mongooseInstance);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default dbConnect;
