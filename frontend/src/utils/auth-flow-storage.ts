export type AuthStep =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'registration-otp'
  | 'password-reset-otp'
  | 'reset-password';

interface AuthFlowStorage {
  step: AuthStep;
  userId?: string;
  expiresAt?: string;
  resetToken?: string;
}

const AUTH_FLOW_STORAGE_KEY = 'auth-flow';

export function saveAuthFlow(flow: AuthFlowStorage): void {
  sessionStorage.setItem(
    AUTH_FLOW_STORAGE_KEY,
    JSON.stringify(flow),
  );
}

export function getAuthFlow(): AuthFlowStorage | null {
  const storedFlow = sessionStorage.getItem(
    AUTH_FLOW_STORAGE_KEY,
  );

  if (!storedFlow) {
    return null;
  }

  try {
    return JSON.parse(storedFlow) as AuthFlowStorage;
  } catch {
    sessionStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
    return null;
  }
}

export function updateAuthFlow(
  updates: Partial<AuthFlowStorage>,
): void {
  const currentFlow = getAuthFlow();

  if (!currentFlow) {
    return;
  }

  saveAuthFlow({
    ...currentFlow,
    ...updates,
  });
}

export function clearAuthFlow(): void {
  sessionStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
}

