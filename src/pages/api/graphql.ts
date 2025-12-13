import type { NextApiRequest, NextApiResponse } from "next";
import { createSchema, createYoga } from "graphql-yoga";
import { verifyToken } from "@/libs/jwt";

// ✅ 중요: yoga가 바디를 직접 처리하도록
export const config = {
  api: {
    bodyParser: false,
  },
};

const yoga = createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
  user: any | null;
}>({
  graphqlEndpoint: "/api/graphql",

  schema: createSchema({
    typeDefs: `
      type Query {
        test: TestResult!
      }
      type TestResult {
        isLogined: Boolean!
      }
    `,
    resolvers: {
      Query: {
        test: (_, __, ctx) => ({
          isLogined: Boolean(ctx.user),
        }),
      },
    },
  }),

  context: ({ req }) => {
    const auth = req.headers.authorization;
    if (!auth) return { user: null };

    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (!match) return { user: null };

    try {
      const decoded: any = verifyToken(match[1]);
      if (decoded.type !== "access") throw new Error("NOT_ACCESS");
      return { user: decoded };
    } catch {
      // Authorization이 있었는데 무효면 401을 주기 위해 에러 던짐
      throw new Error("UNAUTHORIZED");
    }
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ APQ hash-only GET 요청이면: PersistedQueryNotFound를 반환해서
  //    Apollo가 자동으로 query 포함 POST로 재시도하게 만듦
  const hasQueryString =
    typeof req.query.query === "string" && req.query.query.length > 0;
  const hasApqExt =
    typeof req.query.extensions === "string" &&
    req.query.extensions.includes("persistedQuery");

  if (req.method === "GET" && !hasQueryString && hasApqExt) {
    return res.status(200).json({
      errors: [
        {
          message: "PersistedQueryNotFound",
          extensions: { code: "PERSISTED_QUERY_NOT_FOUND" },
        },
      ],
    });
  }

  try {
    return await yoga(req, res);
  } catch {
    return res.status(401).json({ message: "invalid or expired access token" });
  }
}
