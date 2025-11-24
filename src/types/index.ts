import { z } from "zod";
import {
  cartItemSchema,
  insertCartSchema,
  insertProductSchema,
  shippingAddressSchema,
} from "@/lib/validator";

// Product type for displaying products (from database)
export type Product = Omit<z.infer<typeof insertProductSchema>, "price"> & {
  id: string;
  price: string; // Prisma Decimal is serialized as string
  createdAt: Date;
  rating: string;
  numReviews: number;
};

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
