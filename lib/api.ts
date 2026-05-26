const DEFAULT_API_URL = 'https://api.emilioeiji.com.br';
const REQUEST_TIMEOUT_MS = 12000;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  const raw = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
  return trimTrailingSlash(String(raw).trim());
}

export function buildApiUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

export async function parseApiError(response: Response) {
  const data = await parseJsonSafe(response);
  if (data && typeof data.detail === 'string') return data.detail;
  if (data && typeof data.error === 'string') return data.error;
  if (data) return JSON.stringify(data);
  return `HTTP ${response.status}`;
}

export async function requestApi(
  path: string,
  options: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildApiUrl(path), {
      ...options,
      signal: controller.signal,
    });
    const data = await parseJsonSafe(response);
    return { response, data };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Tempo limite da requisição excedido.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
