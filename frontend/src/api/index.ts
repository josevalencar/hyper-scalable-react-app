import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_API_URL = "http://10.128.0.119:8090";
const BOOKS_API_URL = "http://10.128.0.119:8000";

function fetchWithTimeout(resource: RequestInfo, options: any = {}) {
  const { timeout = 8000 } = options; // 8 seconds default
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(resource, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

async function getAuthToken() {
  return await AsyncStorage.getItem('access_token');
}

export async function register(name: string, email: string, password: string) {
  try {
    const res = await fetchWithTimeout(`${AUTH_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      timeout: 8000,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Network timeout: Could not reach the server.');
    }
    throw err;
  }
}

export async function login(email: string, password: string) {
  try {
    const formBody = new URLSearchParams();
    formBody.append('username', email);
    formBody.append('password', password);

    const res = await fetchWithTimeout(`${AUTH_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
      timeout: 8000,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Network timeout: Could not reach the server.');
    }
    throw err;
  }
}

export async function recoverPassword(email: string) {
  try {
    const res = await fetchWithTimeout(`${AUTH_API_URL}/auth/recover-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      timeout: 8000,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Network timeout: Could not reach the server.');
    }
    throw err;
  }
}

export async function verifyOtp(email: string, otp: string, newPassword: string) {
  try {
    const res = await fetchWithTimeout(`${AUTH_API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, new_password: newPassword }),
      timeout: 8000,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Network timeout: Could not reach the server.');
    }
    throw err;
  }
}

export async function fetchBooks(limit = 10, offset = 0) {
  try {
    const res = await fetchWithTimeout(`${BOOKS_API_URL}/books/?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      timeout: 8000,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Network timeout: Could not reach the server.');
    }
    throw err;
  }
}

export async function getProfile() {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetchWithTimeout(`${AUTH_API_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    timeout: 8000,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProfile({ name, email }: { name: string; email: string }) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetchWithTimeout(`${AUTH_API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email }),
    timeout: 8000,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 