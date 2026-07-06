# ADR-001: Authentication Strategy

**Status:** Accepted  
**Date:** 2025-01-15  
**Author:** Gamestacks Team

## Context

Gamestacks requires a robust, secure authentication system that:

- Supports user registration and login
- Uses Nigerian Naira (₦) for all transactions
- Protects against common attacks (brute force, CSRF, injection)
- Works seamlessly with Supabase and Paystack integration
- Enables admin functionality for game management
- Supports future features like password reset and email verification

The Nigerian market requires careful attention to:

- Mobile-first access (slow networks)
- Payment security for Naira transactions
- User identity verification

## Decision

We adopt a **JWT-based authentication strategy** with the following implementation:

### Core Components

1. **Password Security**
   - Hash passwords with bcrypt (12 salt rounds)
   - Never store plaintext passwords
   - Minimum password requirements:
     - 8 characters
     - At least one uppercase letter
     - At least one number
   - Implement rate limiting on login attempts

2. **JWT Token Strategy**
   - Issue JWT tokens valid for 24 hours
   - Store token in httpOnly cookie (prevents XSS attacks)
   - Include `userId`, `email`, and `isAdmin` in token payload
   - Implement token refresh mechanism for Phase 2
   - Sign tokens with `JWT_SECRET` environment variable

3. **Session Management**
   - Stateless authentication using JWT
   - Track last login timestamp in database
   - Implement logout by clearing httpOnly cookie
   - Support multiple concurrent sessions per user

4. **Email Verification**
   - Generate unique tokens for email verification
   - Tokens expire after 24 hours
   - Send verification link via email (Phase 2)
   - Block unverified accounts from checkout (Phase 3)

5. **Password Reset Flow**
   - Generate reset token valid for 1 hour
   - Send reset link via email
   - Require new password matching security policy
   - Invalidate token after successful reset

### API Routes

| Route                       | Method | Purpose             | Auth Required |
| --------------------------- | ------ | ------------------- | ------------- |
| `/api/auth/signup`          | POST   | Register new user   | No            |
| `/api/auth/login`           | POST   | Authenticate user   | No            |
| `/api/auth/logout`          | POST   | Clear session       | Yes           |
| `/api/auth/verify-email`    | POST   | Verify email token  | No            |
| `/api/auth/forgot-password` | POST   | Request reset token | No            |
| `/api/auth/reset-password`  | POST   | Reset password      | No            |

### Database Schema

**Users Table:**

- `id`: UUID (primary key)
- `email`: Unique email address
- `password_hash`: Bcrypt-hashed password
- `full_name`: User's full name
- `is_verified`: Email verification status
- `verification_token`: Token for email verification
- `verification_token_expires_at`: Expiration timestamp
- `is_admin`: Admin privilege flag
- `last_login_at`: Last successful login timestamp

### Security Measures

1. **Attack Prevention**
   - ✅ Bcrypt hashing prevents rainbow table attacks
   - ✅ 12 salt rounds provide strong protection
   - ✅ httpOnly cookies prevent XSS token theft
   - ✅ Rate limiting prevents brute force (Phase 2)
   - ✅ CSRF tokens on form submissions (Phase 2)
   - ✅ Token signing prevents tampering

2. **Data Protection**
   - ✅ HTTPS in production (enforced by Vercel)
   - ✅ Environment variables for secrets
   - ✅ No sensitive data in JWT payload
   - ✅ Password reset tokens invalidated after use

3. **User Privacy**
   - ✅ Email addresses stored securely
   - ✅ Password hashes never exposed
   - ✅ Consistent error messages (don't reveal user existence)

### Implementation Details

**Signup Flow:**

1. User submits email, password, full name
2. Validate email format and password strength
3. Check if user already exists
4. Hash password with bcrypt
5. Create user in `users` table
6. Create profile in `user_profiles` table
7. Generate verification token (24h expiry)
8. Send verification email (Phase 2)
9. Return success message

**Login Flow:**

1. User submits email and password
2. Find user by email
3. Compare password with stored hash
4. Generate JWT token (24h expiry)
5. Update `last_login_at` timestamp
6. Set token in httpOnly cookie
7. Return user info and token

**Protected Route Middleware:**

1. Extract token from cookie or Authorization header
2. Verify JWT signature and expiration
3. Attach user info to request
4. Allow or deny access
5. Return 401 if unauthorized

## Alternatives Considered

1. **Session-based authentication**
   - ❌ Requires server-side session storage
   - ❌ Harder to scale across multiple servers
   - ✅ Traditional approach (unnecessary for stateless Next.js)

2. **OAuth (Google, Facebook)**
   - ❌ Adds external dependency
   - ❌ Users may not have Google/Facebook accounts
   - ✅ Better for future Phase 4: Social features

3. **Magic links (passwordless)**
   - ❌ Requires email service (Phase 2 depends on this anyway)
   - ✅ Better UX (but adds complexity now)

## Consequences

### Positive

- ✅ Stateless authentication scales easily
- ✅ Bcrypt hashing is industry standard
- ✅ JWT tokens are standardized and widely supported
- ✅ httpOnly cookies prevent common XSS attacks
- ✅ Works well with Supabase Row Level Security (RLS)
- ✅ Supports admin functionality natively
- ✅ Email verification prevents abuse

### Negative

- ⚠️ Requires careful token management
- ⚠️ Must implement rate limiting (Phase 2)
- ⚠️ Token refresh adds complexity (Phase 2)
- ⚠️ Email service required for verification (Phase 2)

## Testing Strategy

**Unit Tests (80%+ coverage):**

- ✅ `hashPassword()` - produces valid bcrypt hashes
- ✅ `verifyPassword()` - correctly validates passwords
- ✅ `validatePassword()` - enforces security policy
- ✅ `isValidEmail()` - validates email format
- ✅ `generateToken()` - creates unique tokens

**Integration Tests:**

- ✅ Signup creates user and profile
- ✅ Login returns valid JWT
- ✅ Protected routes reject invalid tokens
- ✅ Password reset invalidates token

**E2E Tests:**

- ✅ User can sign up and log in
- ✅ User can reset password
- ✅ User can log out
- ✅ Unverified emails cannot checkout (Phase 3)

## Compliance & Security Standards

- ✅ OWASP Top 10 protection
- ✅ CWE-522: Insufficiently Protected Credentials (bcrypt)
- ✅ CWE-347: Improper Verification of Cryptographic Signature
- ✅ CWE-384: Session Fixation (unique tokens per session)

## Related Decisions

- **ADR-002:** Token Refresh Strategy (Phase 2)
- **ADR-003:** Rate Limiting & DDoS Protection (Phase 2)
- **ADR-004:** Email Service Integration (Phase 2)
- **ADR-005:** Payment Security & PCI Compliance (Phase 3)

## Revision History

| Date       | Version | Change                     |
| ---------- | ------- | -------------------------- |
| 2025-01-15 | 1.0     | Initial decision (Phase 1) |
