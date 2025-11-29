import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    // Disable admin UI in production if DISABLE_ADMIN is set
    disable: process.env.DISABLE_ADMIN === "true",
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    // Payment Module with providers
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          // Stripe - for international payments (US, UK, EU, etc.)
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            },
          },
          // Paystack - for Ghana and African countries
          {
            resolve: "medusa-payment-paystack",
            id: "paystack",
            options: {
              secret_key: process.env.PAYSTACK_SECRET_KEY,
            },
          },
        ],
      },
    },
    // Redis Event Bus for better performance
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    // Redis Cache
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
  ],
})
