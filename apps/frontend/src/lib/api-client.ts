import axios, { type AxiosError } from "axios";
import { getSession } from "next-auth/react";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/rest";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

// getSession() hits the NextAuth session endpoint via relative fetch, so this only works client-side.
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const responseMessage = error.response?.data?.message;
    const message = Array.isArray(responseMessage) ? responseMessage.join(", ") : responseMessage;
    return Promise.reject(new Error(message ?? error.message));
  }
);
