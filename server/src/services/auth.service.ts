import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";

function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

export async function registerUser(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [input.name, input.email.toLowerCase(), passwordHash]
    );
    const user = result.rows[0];
    return { user, token: signToken(user.id) };
  } catch (err: any) {
    if (err.code === "23505") {
      throw new AppError(409, "Email already registered");
    }
    throw err;
  }
}

export async function loginUser(input: LoginInput) {
  const result = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = $1",
    [input.email.toLowerCase()]
  );
  const user = result.rows[0];
  const ok = user && (await bcrypt.compare(input.password, user.password_hash));
  if (!ok) {
    throw new AppError(401, "Invalid email or password");
  }
  return {
    user: { id: user.id, name: user.name, email: user.email },
    token: signToken(user.id),
  };
}