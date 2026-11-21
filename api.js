/**
 * Central API client.
 * All fetch calls go through here so the token is attached automatically.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return sessionStorage.getItem('gvhToken');
}

export function saveToken(token) {
  sessionStorage.setItem('gvhToken', token);
}

export function clearToken() {
  sessionStorage.removeItem('gvhToken');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
