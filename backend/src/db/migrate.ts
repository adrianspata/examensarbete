import pool from "./pool.js";
import { createProductsTableSQL } from "../models/productModel.js";
import { createSessionsTableSQL } from "../models/sessionModel.js";
import { createEventsTableSQL } from "../models/eventModel.js";

async function migrate() {
  console.log("Running database migrations...");

  try {
    await pool.query("BEGIN");

    console.log("Creating products table...");
    await pool.query(createProductsTableSQL);

    console.log("Creating sessions table...");
    await pool.query(createSessionsTableSQL);

    console.log("Creating events table...");
    await pool.query(createEventsTableSQL);

    await pool.query("COMMIT");
    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed, rolling back...", error);
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

migrate();
