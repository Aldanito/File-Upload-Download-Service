import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { JwtDecodedPayload, JwtSignPayload } from "../types/auth.js";

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = "1h";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtSignPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtDecodedPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.verify(token, secret) as JwtDecodedPayload;
}
