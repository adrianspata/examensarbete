import { pool } from "./pool.js";

interface SeedProduct {
  sku: string;
  name: string;
  category: string;
  priceCents: number;
  imageUrl: string | null;
}

const products: SeedProduct[] = [
  {
    sku: "TEE-BASIC-BLACK",
    name: "Basic Black T-Shirt",
    category: "t-shirts",
    priceCents: 19900,
    imageUrl: "/images/tee-basic-black.jpg",
  },
  {
    sku: "TEE-BASIC-WHITE",
    name: "Basic White T-Shirt",
    category: "t-shirts",
    priceCents: 19900,
    imageUrl: "/images/tee-basic-white.jpg",
  },
  {
    sku: "HOODIE-OVERSIZE-GREY",
    name: "Oversized Grey Hoodie",
    category: "hoodies",
    priceCents: 49900,
    imageUrl: "/images/hoodie-oversize-grey.jpg",
  },
  {
    sku: "HOODIE-CLASSIC-NAVY",
    name: "Classic Navy Hoodie",
    category: "hoodies",
    priceCents: 45900,
    imageUrl: "/images/hoodie-classic-navy.jpg",
  },
  {
    sku: "SNEAKER-LOW-WHITE",
    name: "Low White Sneakers",
    category: "sneakers",
    priceCents: 89900,
    imageUrl: "/images/sneaker-low-white.jpg",
  },
  {
    sku: "SNEAKER-RUNNER-BLACK",
    name: "Black Runner Sneakers",
    category: "sneakers",
    priceCents: 99900,
    imageUrl: "/images/sneaker-runner-black.jpg",
  },
  {
    sku: "CAP-LOGO-BLACK",
    name: "Black Logo Cap",
    category: "accessories",
    priceCents: 24900,
    imageUrl: "/images/cap-logo-black.jpg",
  },
  {
    sku: "BAG-TOTE-NATURAL",
    name: "Natural Canvas Tote Bag",
    category: "accessories",
    priceCents: 29900,
    imageUrl: "/images/bag-tote-natural.jpg",
  }
];

async function seedProducts() {
  console.log("Seeding products...");

  try {
    await pool.query("BEGIN");

    for (const product of products) {
      await pool.query(
        `
        INSERT INTO products (sku, name, category, price_cents, image_url)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (sku) DO NOTHING;
      `,
        [
          product.sku,
          product.name,
          product.category,
          product.priceCents,
          product.imageUrl,
        ]
      );
    }

    await pool.query("COMMIT");
    console.log("Seeding completed.");
  } catch (error) {
    console.error("Seeding failed, rolling back...", error);
    try {
      await pool.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log("Running seed script...");
  await seedProducts();
}

main();
