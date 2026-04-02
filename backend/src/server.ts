import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 4005;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL connected successfully");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

startServer();