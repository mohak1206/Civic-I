/**
 * Auth API Service for Civic-I.
 * Matches POST /auth/login and POST /auth/register contracts.
 * Follows PROJECT_RULES.md:
 * - Passwords and tokens are never logged
 * - Mock mode generates test tokens and generic identities
 */

export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required.' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 30) {
    return { valid: false, error: 'Username must be between 3 and 30 characters.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Username may only contain letters, numbers, and underscores.' };
  }
  return { valid: true, error: null };
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters.' };
  }
  return { valid: true, error: null };
}

/**
 * Creates a mock JWT structure (header.payload.signature) for testing
 */
function createMockJWT(payload) {
  const b64 = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  const header = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 * 8,
  });
  const sig = btoa('mock-hmac-signature-civici');
  return `${header}.${body}.${sig}`;
}

/**
 * Login API call
 */
export async function loginApi(username, password, role = 'citizen') {
  const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Basic credential validation simulation
    if (password === 'fail_test') {
      throw new Error('Invalid username or password.');
    }

    const token = createMockJWT({ sub: username, role });
    return {
      token,
      user: {
        username,
        role,
      },
    };
  }

  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 400) {
      throw new Error('Invalid username or password.');
    }
    throw new Error('Server unreachable or temporary error. Please try again.');
  }

  return res.json();
}

/**
 * Register API call
 */
export async function registerApi(username, password) {
  const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const token = createMockJWT({ sub: username, role: 'citizen' });
    return {
      token,
      user: {
        username,
        role: 'citizen',
      },
    };
  }

  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error('Username already exists. Please choose another.');
    }
    throw new Error('Registration failed. Please try again later.');
  }

  return res.json();
}
