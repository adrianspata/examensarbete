const API_BASE_URL = "http://localhost:4000";

export interface HealthResponse {
  status: string;
  service: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);

  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }

  return res.json();
}
