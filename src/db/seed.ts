import { PrismaClient } from "@prisma/client";
import sampleData from "./sample-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing products
  await prisma.product.deleteMany();
  console.log("✅ Cleared existing products");

  // Seed products
  await prisma.product.createMany({ data: sampleData.products });
  console.log(`✅ Created ${sampleData.products.length} products`);

  console.log("🎉 Database seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
