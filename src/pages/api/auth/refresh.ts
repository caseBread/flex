import { API_BASE_URL } from "@/constants/URL";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

type SetAuthTokenCookieProps = {
  response: NextApiResponse;
  host: string;
  accessToken?: string;
  refreshToken?: string;
};

/**
 * response를 받아서 쿠키 세팅하는 함수 (서버에서)
 */
export const setAuthTokenCookie = ({
  response,
  host,
  accessToken,
  refreshToken,
}: SetAuthTokenCookieProps) => {
  const cookieHeader = [];

  if (accessToken) {
    cookieHeader.push(
      // Q : SameSite는 왜넣었나요? A : 기본값이 Lax가 아닌 브라우저가 있어서 https://caniuse.com/?search=samesite
      `accessToken=${accessToken}; Domain=${host}; Max-Age=${
        7 * 24 * 60 * 60
      }; Path=/; Secure; SameSite=Lax;`
    );
  }
  if (refreshToken) {
    cookieHeader.push(
      `refreshToken=${refreshToken}; Domain=${host}; Max-Age=${
        7 * 24 * 60 * 60
      }; Path=/; Secure; HttpOnly; SameSite=Lax;`
    );
  }

  response.setHeader("Set-Cookie", cookieHeader);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  res.setHeader("Cache-Control", "private, no-cache, no-store");

  const currentHost = req?.headers?.host ?? "";
  const cookies = parseCookies({ req });

  // 백엔드 Token Refresh API
  const response = await fetch(`${API_BASE_URL}/auth/token/refresh-token`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ token: cookies.refreshToken }),
  });

  const {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }: { accessToken?: string; refreshToken?: string } = await response.json();

  if (!newAccessToken || !newRefreshToken) {
    throw new Error("token refresh failed");
  }

  setAuthTokenCookie({
    response: res,
    host: currentHost,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });

  return res.status(200).json({
    accessToken: newAccessToken,
  });
}
