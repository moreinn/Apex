import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db/pool";
import { authRouter } from "./routes/auth.routes";
import { requireAuth, AuthRequest } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "Apex" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT now() AS time");
    res.json({ status: "ok", time: result.rows[0].time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "DB connection failed" });
  }
});

app.use("/auth", authRouter);

app.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.userId]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});