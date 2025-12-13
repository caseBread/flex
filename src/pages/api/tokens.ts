import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

type SetAuthTokenCookieProps = {
  response: NextApiResponse;
  host: string;
  accessToken: string;
  refreshToken: string;
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
      }; Path=/; Secure; HttpOnly; SameSite=Lax;`
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

/**
 * accessToken과 refreshToken을 CRUD하는 API
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "private, no-cache, no-store");
  const currentHost = req?.headers?.host ?? "";
  const cookieHeader = req.headers.cookie;

  if (req.method === "POST") {
    const { accessToken, refreshToken } = req.body;

    if (!accessToken && !refreshToken) {
      res.status(400).json({ error: "No token provided to update" });
      return;
    }

    setAuthTokenCookie({
      response: res,
      host: currentHost,
      accessToken,
      refreshToken,
    });
    res.status(200).json({ message: "Tokens updated" });
  } else if (req.method === "DELETE") {
    if (!cookieHeader) {
      res.status(400).json({ error: "No cookie found" });
      return;
    }

    const cookies = parseCookies({ req });
    const { accessToken, refreshToken } = cookies;

    if (!accessToken && !refreshToken) {
      res.status(400).json({ error: "No cookies to delete" });
      return;
    }

    res.setHeader("Set-Cookie", [
      `accessToken=; Domain=${currentHost}; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax;`,
      `refreshToken=; Domain=${currentHost}; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax;`,
    ]);
    res.status(200).json({ message: "Cookies deleted" });
  } else {
    res.setHeader("Allow", ["POST", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
