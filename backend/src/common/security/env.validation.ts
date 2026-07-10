const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'FRONTEND_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
] as const;

const INSECURE_DEFAULTS = new Map<string, string[]>([
  ['BETTER_AUTH_SECRET', ['change-me-in-production', 'generate-a-random-secret-at-least-32-chars']],
  ['DATABASE_URL', ['postgresql://employepro:changeme@db:5432/employepro', 'postgresql://postgres:postgres@localhost:5432/employepro']],
  ['QR_SECRET', ['employrarh-qr-secret-dev']],
]);

function normalizeUrl(url: string, variableName: string): URL {
  try {
    return new URL(url);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL`);
  }
}

export function validateEnvironment(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const betterAuthSecret = process.env.BETTER_AUTH_SECRET!;
  if (betterAuthSecret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
  }

  const frontendUrl = normalizeUrl(process.env.FRONTEND_URL!, 'FRONTEND_URL');
  const authUrl = normalizeUrl(process.env.BETTER_AUTH_URL!, 'BETTER_AUTH_URL');
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (frontendUrl.protocol !== 'https:' || authUrl.protocol !== 'https:') {
      throw new Error('FRONTEND_URL and BETTER_AUTH_URL must use HTTPS in production');
    }

    for (const [key, defaults] of INSECURE_DEFAULTS.entries()) {
      const value = process.env[key];
      if (value && defaults.includes(value)) {
        throw new Error(`${key} must be overridden with a secure production value`);
      }
    }
  }
}
