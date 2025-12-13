import { signAccessToken, signRefreshToken } from "@/libs/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    accessToken: signAccessToken(), // 10분
    refreshToken: signRefreshToken(), // 7일
  });
}
