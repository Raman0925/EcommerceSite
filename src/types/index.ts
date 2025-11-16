import { z } from "zod";
import { insertProductSchema } from "@/lib/validator";

// Product type for displaying products (from database)
export type Product = Omit<z.infer<typeof insertProductSchema>, "price"> & {
  id: string;
  price: string; // Prisma Decimal is serialized as string
  createdAt: Date;
  rating: string;
  numReviews: number;
};
