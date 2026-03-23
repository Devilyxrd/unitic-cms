const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

type ApiClientOptions = RequestInit & {
};

export async function apiClient<T>(path: string, options?: ApiClientOptions): Promise<T> {
  const { headers, ...rest } = options ?? {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new ApiClientError(json?.message ?? `API isteği başarısız oldu (durum: ${response.status})`, response.status);
  }

  return json as T;
}
