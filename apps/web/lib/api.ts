export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FetchOptions extends RequestInit {
  adminToken?: string;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { adminToken, ...customConfig } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((customConfig.headers as Record<string, string>) || {}),
  };

  if (adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...customConfig,
    headers,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : (null as unknown as T);
}
