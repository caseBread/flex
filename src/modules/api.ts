import axios, { AxiosRequestConfig } from "axios";
import { buildQuery } from "@/utils/buildQuery";
import { RefreshTokenAdapter } from "./refreshTokenAdapter";
import { getRestoreAuthToken } from "./getRestoreAuthToken";
import { API_BASE_URL, CLIENT_BASE_URL } from "@/constants/URL";
import nookies from "nookies";

type RequestOptions = {
  path: string;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
};

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 60000,
});

const refreshTokenAdapter = new RefreshTokenAdapter<
  void,
  { accessToken: string }
>({
  refreshTokenFetcher: getRestoreAuthToken,
});

client.interceptors.request.use(
  async (config) => {
    const cookies = typeof window !== "undefined" ? nookies.get() : {};

    if (cookies.accessToken) {
      config.headers.Authorization = `Bearer ${cookies.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      void refreshTokenAdapter
        .getRefreshedAccessToken()
        .then(async (response) => {
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        })
        .catch(async (err) => {
          await fetch(`${CLIENT_BASE_URL}/api/tokens`, {
            method: "DELETE",
          });

          originalRequest.headers.Authorization = ``;
        });
    }

    return Promise.reject(error);
  }
);

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  { path, params, headers, body }: RequestOptions
): Promise<T> {
  const url = `${path}${buildQuery(params)}`;

  const config: AxiosRequestConfig = {
    url,
    method,
    headers,
    ...(method === "GET" ? {} : { data: body }),
  };

  try {
    const res = await client.request<T>(config);
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export const api = {
  get: <T>(options: RequestOptions) => request<T>("GET", options),
  post: <T>(options: RequestOptions) => request<T>("POST", options),
  put: <T>(options: RequestOptions) => request<T>("PUT", options),
  delete: <T>(options: RequestOptions) => request<T>("DELETE", options),
  patch: <T>(options: RequestOptions) => request<T>("PATCH", options),
};
