const rateLimit = require('express-rate-limit');

const jsonError = (message) => (_req, res) => {
  res.status(429).json({ success: false, message });
};

/** 5 login attempts per 15 minutes */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonError('Too many login attempts. Please try again in 15 minutes.'),
});

/** 3 registrations per hour */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonError('Too many registration attempts. Please try again in an hour.'),
});

/** 3 password-reset requests per hour */
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonError('Too many password-reset requests. Please try again in an hour.'),
});

/** 5 OTP resend requests per hour */
const otpResendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonError('Too many OTP resend requests. Please try again later.'),
});

module.exports = { loginLimiter, registerLimiter, resetLimiter, otpResendLimiter };
