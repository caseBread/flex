import { CLIENT_BASE_URL } from "@/constants/URL";

export const getRestoreAuthToken = async (): Promise<{
  accessToken: string;
}> => {
  const response = await fetch(`${CLIENT_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  });

  const { accessToken: newAccessToken } = await response.json();

  if (!newAccessToken) {
    throw new Error("로그아웃");
  }

  return { accessToken: newAccessToken };
};
