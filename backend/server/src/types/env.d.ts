declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string
    NODE_ENV: 'development' | 'production' | 'test'

    MONGO_URI: string
    MONGO_URI_STANDARD?: string
    MONGO_SKIP_DNS_FIX?: string

    JWT_SECRET: string
    JWT_REFRESH_SECRET?: string
    JWT_EMAIL_SECRET: string
    JWT_EXPIRE: string
    JWT_ACCESS_EXPIRE?: string
    JWT_REFRESH_EXPIRE?: string

    EMAIL_FROM: string
    EMAIL_APP_PASSWORD: string

    CLIENT_URL: string

    CORS_CLIENTS: string
    CORS_ALLOW_NO_ORIGIN?: string

    CLOUDINARY_CLOUD_NAME: string
    CLOUDINARY_API_KEY: string
    CLOUDINARY_API_SECRET: string
  }
}
