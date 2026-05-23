const MIN_JWT_SECRET_LENGTH = 32

function requireNonEmpty(name: string, value: string | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return trimmed
}

export function validateEnv(): void {
  const jwtSecret = requireNonEmpty('JWT_SECRET', process.env.JWT_SECRET)
  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters`,
    )
  }

  const mongoUri =
    process.env.MONGO_URI_STANDARD?.trim() || process.env.MONGO_URI?.trim()
  if (!mongoUri) {
    throw new Error(
      'Missing required environment variable: MONGO_URI or MONGO_URI_STANDARD',
    )
  }

  requireNonEmpty('JWT_EXPIRE', process.env.JWT_EXPIRE)
  requireNonEmpty('EMAIL_FROM', process.env.EMAIL_FROM)
  requireNonEmpty('EMAIL_APP_PASSWORD', process.env.EMAIL_APP_PASSWORD)
  requireNonEmpty('CLIENT_URL', process.env.CLIENT_URL)
}
