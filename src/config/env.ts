import { config } from "dotenv";
import { z } from "zod";

config();

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    CLOVER_APP_ID: z.string().min(1, "CLOVER_APP_ID is required").optional(),
    CLOVER_APP_SECRET: z.string().min(1, "CLOVER_APP_SECRET is required").optional(),
    CLOVER_MERCHANT_ID: z.string().optional(),
    CLOVER_ACCESS_TOKEN: z.string().optional(),
    CLOVER_WEBHOOK_SECRET: z.string().optional(),
    LIGHTSPEED_ACCOUNT_ID: z.string().optional(),
    LIGHTSPEED_CLIENT_ID: z.string().optional(),
    LIGHTSPEED_CLIENT_SECRET: z.string().optional(),
    LIGHTSPEED_REFRESH_TOKEN: z.string().optional(),
    LIGHTSPEED_PERSONAL_TOKEN: z.string().optional(),
    LIGHTSPEED_SHOP_ID: z.string().optional(),
    LIGHTSPEED_EMPLOYEE_ID: z.string().optional(),
    LIGHTSPEED_REGISTER_ID: z.string().optional(),
    WEBHOOK_SIGNATURE_SECRET: z.string().optional(),
    QUEUE_URL: z.string().url().optional(),
    AWS_REGION: z.string().optional(),
  })
  .transform((value) => ({
    ...value,
    IS_PRODUCTION: value.NODE_ENV === "production",
    USE_QUEUE: Boolean(value.QUEUE_URL),
  }));

const env = EnvSchema.parse(process.env);

export type Env = typeof env;
export { env };
