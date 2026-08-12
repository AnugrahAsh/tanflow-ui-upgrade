/* Everything the sign-in flow needs to behave like the real thing without a
   backend: methods, lockout thresholds, the demo OTP and password policy. */

export const MAX_ATTEMPTS = 3
export const LOCK_SECONDS = 30
export const RESEND_SECONDS = 30
export const EXPIRY_DAYS = 3

export const VERIFY_METHODS = [
  { id: 'email', icon: 'mail', label: 'Verify via Email OTP', hint: 'Receive OTP directly to your email' },
  { id: 'sms', icon: 'chat', label: 'Verify via SMS OTP', hint: 'Verify your mobile number first, then receive OTP via SMS' },
]

export const OTP_LENGTH = 6
export const DEMO_OTP = '481902'
export const DEMO_LAST4 = '4417'

export const maskEmail = (user) => {
  const name = String(user || 'user').toLowerCase().replace(/[^a-z0-9._-]/g, '')
  const head = name.slice(0, 2)
  return `${head}${'•'.repeat(Math.max(3, name.length - 2))}@tanflow.com`
}

export const passwordScore = (v) => {
  let n = 0
  if (v.length >= 12) n += 1
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) n += 1
  if (/\d/.test(v)) n += 1
  if (/[^A-Za-z0-9]/.test(v)) n += 1
  return n
}

export const SCORE_LABEL = ['Too short', 'Weak', 'Fair', 'Strong', 'Very strong']
export const SCORE_TONE = ['bad', 'bad', 'warn', 'ok', 'ok']

export const RULES = [
  { id: 'len', label: 'At least 12 characters', test: (v) => v.length >= 12 },
  { id: 'case', label: 'Upper and lower case', test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) },
  { id: 'num', label: 'At least one number', test: (v) => /\d/.test(v) },
  { id: 'sym', label: 'At least one symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
]
