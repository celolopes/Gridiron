import axios, { AxiosInstance } from "axios";

export interface ApiClientOptions {
  baseURL: string;
  timeout?: number;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(options: ApiClientOptions) {
    this.client = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Logging in dev
    if (process.env.NODE_ENV === "development") {
      this.client.interceptors.request.use((config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      });

      this.client.interceptors.response.use(
        (response) => {
          console.log(`[API Response] ${response.status} ${response.config.url}`);
          return response;
        },
        (error) => {
          console.error(`[API Error] ${error.response?.status || "Network Error"} ${error.config?.url}`);
          return Promise.reject(error);
        },
      );
    }
  }

  public buildTenantUrl(tenantSlug: string, path: string): string {
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `/${tenantSlug}/${cleanPath}`;
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

// Helper to create a standard client
export const createApiClient = (baseURL: string) => {
  return new ApiClient({ baseURL });
};
