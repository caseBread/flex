import { signAccessToken, signRefreshToken, verifyToken } from "@/libs/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "token is required" });
  }

  try {
    const decoded: any = verifyToken(token);

    // refresh token만 허용
    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "invalid refresh token" });
    }

    return res.status(200).json({
      accessToken: signAccessToken(),
      refreshToken: signRefreshToken(),
    });
  } catch {
    return res.status(401).json({ message: "invalid or expired token" });
  }
}
