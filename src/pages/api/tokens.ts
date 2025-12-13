import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  res.setHeader("Cache-Control", "private, no-cache, no-store");

  const currentHost = req?.headers?.host ?? "";
  const cookies = parseCookies({ req });
  const { accessToken, refreshToken } = cookies;

  if (!accessToken && !refreshToken) {
    res.status(200).json({ message: "No cookies to delete" });
    return;
  }

  res.setHeader("Set-Cookie", [
    `accessToken=; Domain=${currentHost}; Max-Age=0; Path=/; Secure; SameSite=Lax;`,
    `refreshToken=; Domain=${currentHost}; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax;`,
  ]);
  res.status(200).json({ message: "Cookies deleted" });
}
