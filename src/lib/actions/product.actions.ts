"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "@/lib/utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validator";
import { Product } from "@/types";

export async function getLatestProducts(): Promise<Product[]> {
  try {
    const data = await prisma.product.findMany({
      take: LATEST_PRODUCTS_LIMIT,
      orderBy: { createdAt: "desc" },
    });

    return convertToPlainObject(data) as unknown as Product[];
  } catch (error) {
    console.warn("Failed to load latest products", error);
    return [];
  }
}

export const getProductById = async (id: string) => {
  const data = await prisma.product.findUnique({ where: { id } });
  return convertToPlainObject(data);
};

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug },
  });
}

// Get featured products
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const data = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    return convertToPlainObject(data) as unknown as Product[];
  } catch (error) {
    console.warn("Failed to load featured products", error);
    return [];
  }
}

// Get product categories
export async function getAllCategories() {
  try {
    const data = await prisma.product.groupBy({
      by: ["category"],
      _count: true,
    });

    return data;
  } catch (error) {
    console.warn("Failed to load product categories", error);
    return [];
  }
}

export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price = "all",
  rating = "all",
  sort = "newest",
}: {
  query: string;
  limit?: number;
  page: number;
  category: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // Filter by query
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  // Filter by category
  const categoryFilter = category && category !== "all" ? { category } : {};

  // Filter by price
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};

  // Filter by rating
  const ratingFilter =
    rating && rating !== "all" ? { rating: { gte: Number(rating) } } : {};

  // Fetch products
  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...ratingFilter,
      ...priceFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
          ? { price: "desc" }
          : sort === "rating"
            ? { rating: "desc" }
            : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...ratingFilter,
      ...priceFilter,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({ data: product });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    await prisma.product.update({ where: { id: product.id }, data: product });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
