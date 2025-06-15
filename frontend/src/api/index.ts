const API_URL = "http://192.168.0.163:8000";

function fetchWithTimeout(resource: RequestInfo, options: any = {}) {
  const { timeout = 8000 } = options; // 8 seconds default
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(resource, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

export async function register(email: string, password: string) {
  try {
    const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
    const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
    const res = await fetchWithTimeout(`${API_URL}/auth/recover-password`, {
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
    const res = await fetchWithTimeout(`${API_URL}/auth/verify-otp`, {
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