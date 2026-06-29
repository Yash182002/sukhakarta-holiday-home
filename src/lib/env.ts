import { z } from 'zod';

const envSchema = z.object({
  // Public (accessible in browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // Server-only (never exposed to browser)
  RAZORPAY_KEY_ID: z.string().min(1, 'Razorpay key ID is required').optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'Razorpay secret is required').optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'Razorpay webhook secret is required').optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase Service Role key is required').optional(),
});

// Validate at build time
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(' Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

export function getServerEnv(key: keyof typeof env) {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
