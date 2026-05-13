const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 500;

type RetryOptions = {
  maxAttempts?: number;
  delayMs?: number;
};

function waitForRetry(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const delayMs = options.delayMs ?? DEFAULT_RETRY_DELAY_MS;
  let attempt = 1;

  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch {
      await waitForRetry(delayMs * attempt);
      attempt += 1;
    }
  }

  return operation();
}

export { DEFAULT_MAX_ATTEMPTS, DEFAULT_RETRY_DELAY_MS };
