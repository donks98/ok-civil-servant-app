import { Alert } from 'react-native';

// ─── Error classification ──────────────────────────────────────────────────

export type AppError =
  | { kind: 'network' }
  | { kind: 'auth'; message: string }
  | { kind: 'validation'; message: string }
  | { kind: 'not_found'; message: string }
  | { kind: 'server'; message: string }
  | { kind: 'unknown'; message: string };

export function classifyError(err: unknown): AppError {
  if (!err) return { kind: 'unknown', message: 'Something went wrong' };

  const msg: string =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as any).message)
        : String(err);

  const lower = msg.toLowerCase();

  // Network / connectivity
  if (
    lower.includes('network request failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('econnrefused') ||
    lower.includes('timeout')
  ) {
    return { kind: 'network' };
  }

  // Auth
  if (lower.includes('unauthorized') || lower.includes('invalid token') || lower.includes('token')) {
    return { kind: 'auth', message: 'Your session has expired. Please log in again.' };
  }

  // Validation / bad request
  if (
    lower.includes('invalid') ||
    lower.includes('required') ||
    lower.includes('must be') ||
    lower.includes('already') ||
    lower.includes('not found')
  ) {
    return { kind: 'validation', message: msg };
  }

  // Server error
  if (lower.includes('server') || lower.includes('500') || lower.includes('database')) {
    return { kind: 'server', message: 'A server error occurred. Please try again later.' };
  }

  return { kind: 'unknown', message: msg };
}

// ─── User-facing messages ──────────────────────────────────────────────────

export function friendlyMessage(err: AppError): string {
  switch (err.kind) {
    case 'network':
      return 'Cannot reach the server. Check your internet connection and try again.';
    case 'auth':
      return err.message;
    case 'validation':
      return err.message;
    case 'not_found':
      return err.message;
    case 'server':
      return err.message;
    case 'unknown':
      return err.message || 'Something went wrong. Please try again.';
  }
}

// ─── Show alert helper ─────────────────────────────────────────────────────

export function showError(err: unknown, title = 'Error') {
  const classified = classifyError(err);
  Alert.alert(title, friendlyMessage(classified));
}

// ─── Typed async wrapper — returns [data, error] ───────────────────────────

export async function safeAsync<T>(
  fn: () => Promise<T>,
): Promise<[T, null] | [null, AppError]> {
  try {
    const data = await fn();
    return [data, null];
  } catch (err) {
    return [null, classifyError(err)];
  }
}
