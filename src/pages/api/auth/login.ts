import { API_BASE_URL } from "@/constants/URL";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  res.setHeader("Cache-Control", "private, no-cache, no-store");

  try {
    const loginRes = await fetch(`${API_BASE_URL}/api/token/login`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!loginRes.ok) {
      return res.status(500).json({ message: "login api failed" });
    }

    const { accessToken, refreshToken } = await loginRes.json();

    const cookieHeader: string[] = [];

    if (accessToken) {
      cookieHeader.push(
        `accessToken=${accessToken}; Max-Age=${
          7 * 24 * 60 * 60
        }; Path=/; Secure; SameSite=Lax;`
      );
    }

    if (refreshToken) {
      cookieHeader.push(
        `refreshToken=${refreshToken}; Max-Age=${
          7 * 24 * 60 * 60
        }; Path=/; Secure; HttpOnly; SameSite=Lax;`
      );
    }

    res.setHeader("Set-Cookie", cookieHeader);
    res.setHeader("Cache-Control", "private, no-cache, no-store");

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ message: "internal server error" });
  }
}
