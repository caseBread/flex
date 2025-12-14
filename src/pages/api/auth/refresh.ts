import { API_BASE_URL } from "@/constants/URL";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

type SetAuthTokenCookieProps = {
  response: NextApiResponse;
  accessToken?: string;
  refreshToken?: string;
};

/**
 * response를 받아서 쿠키 세팅하는 함수 (서버에서)
 */
export const setAuthTokenCookie = ({
  response,
  accessToken,
  refreshToken,
}: SetAuthTokenCookieProps) => {
  const cookieHeader = [];

  if (accessToken) {
    cookieHeader.push(
      // Q : SameSite는 왜넣었나요? A : 기본값이 Lax가 아닌 브라우저가 있어서 https://caniuse.com/?search=samesite
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

  const cookies = parseCookies({ req });
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "refresh token missing" });
  }

  try {
    // 백엔드 Token Refresh API
    const response = await fetch(`${API_BASE_URL}/api/token/refresh-token`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    const responseText = await response.text();

    if (!responseText) {
      return res
        .status(502)
        .json({ message: "empty response from auth server" });
    }

    let parsedJson: { accessToken?: string; refreshToken?: string };

    try {
      parsedJson = JSON.parse(responseText);
    } catch {
      return res
        .status(502)
        .json({ message: "invalid response from auth server" });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      parsedJson;

    if (!response.ok || !newAccessToken || !newRefreshToken) {
      return res
        .status(response.status || 401)
        .json({ message: "refresh failed" });
    }

    setAuthTokenCookie({
      response: res,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "token refresh request failed" });
  }
}
