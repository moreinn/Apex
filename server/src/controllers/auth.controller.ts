import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/AppError";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Invalid input", parsed.error.flatten().fieldErrors);
    }
    const result = await authService.registerUser(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Invalid input");
    }
    const result = await authService.loginUser(parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}