import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signAccessToken() {
  return jwt.sign({ sub: "test-user", type: "access" }, JWT_SECRET, {
    expiresIn: "10m",
  });
}

export function signRefreshToken() {
  return jwt.sign({ sub: "test-user", type: "refresh" }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
