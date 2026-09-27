import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MeilisearchClient {
  constructor(private readonly config: ConfigService) {}

  async request<T = unknown>(path: string, method: string, body?: unknown): Promise<T> {
    const host = this.config.get<string>("MEILISEARCH_HOST", "http://localhost:7701");
    const apiKey = this.config.get<string>("MEILISEARCH_API_KEY");

    const response = await fetch(`${host}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Meilisearch request to ${path} failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
