/**
 * Environment Variable Validation
 * Ensures all required environment variables are set on startup
 */

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

// Critical variables required for basic operation
const REQUIRED_VARS = [
  'NEXT_PUBLIC_SITE_URL',
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'OWNER_PHONE_NUMBER',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'CRON_SECRET'
];

// Recommended but not required
const RECOMMENDED_VARS = [
  'OWNER_EMAIL',
  'NEXT_PUBLIC_BASE_URL',
  'STRIPE_WEBHOOK_SECRET',
  'DISCORD_WEBHOOK_URL'
];

/**
 * Validate environment variables
 * Call this in middleware or API route to ensure config is valid
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    if (!value || value === '' || value.includes('your_') || value.includes('REPLACE')) {
      missing.push(varName);
    }
  }

  // Check recommended variables
  for (const varName of RECOMMENDED_VARS) {
    const value = process.env[varName];
    if (!value || value === '' || value.includes('your_') || value.includes('REPLACE')) {
      warnings.push(varName);
    }
  }

  // Additional validation checks
  if (process.env.NEXT_PUBLIC_SITE_URL === 'http://localhost:3000' && process.env.NODE_ENV === 'production') {
    warnings.push('NEXT_PUBLIC_SITE_URL is still set to localhost in production!');
  }

  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') && process.env.NODE_ENV === 'production') {
    warnings.push('Using Stripe TEST keys in production environment!');
  }

  if (process.env.CRON_SECRET && process.env.CRON_SECRET.length < 20) {
    warnings.push('CRON_SECRET should be at least 20 characters long');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Throw error if environment is invalid
 * Use this in middleware to prevent app from running with bad config
 */
export function assertValidEnv(): void {
  const result = validateEnv();
  
  if (!result.valid) {
    console.error('❌ ENVIRONMENT CONFIGURATION ERROR');
    console.error('Missing required environment variables:');
    result.missing.forEach(v => console.error(`  - ${v}`));
    console.error('\nPlease check your .env.local file and ensure all required variables are set.');
    console.error('See .env.example for reference.');
    throw new Error(`Missing required environment variables: ${result.missing.join(', ')}`);
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  ENVIRONMENT CONFIGURATION WARNINGS:');
    result.warnings.forEach(w => console.warn(`  - ${w}`));
    console.warn('\nThese are not critical but should be addressed before production deployment.');
  }
}

/**
 * Get a safe summary of environment status (no secrets exposed)
 */
export function getEnvStatus() {
  const result = validateEnv();
  
  return {
    valid: result.valid,
    environment: process.env.NODE_ENV,
    requiredVars: {
      total: REQUIRED_VARS.length,
      configured: REQUIRED_VARS.length - result.missing.length,
      missing: result.missing
    },
    recommendedVars: {
      total: RECOMMENDED_VARS.length,
      configured: RECOMMENDED_VARS.length - result.warnings.length,
      missing: result.warnings.filter(w => RECOMMENDED_VARS.includes(w))
    },
    warnings: result.warnings.filter(w => !RECOMMENDED_VARS.includes(w))
  };
}
