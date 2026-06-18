# KINi Outsourcing Services

Production-minded React JavaScript website and secure consultation API for KINi Outsourcing Services.

## Stack

- Frontend: React, Vite, JavaScript, Framer Motion
- API: Node.js, Express, JavaScript
- Database: MongoDB with Mongoose
- Email: SMTP through Nodemailer
- Bot protection: Cloudflare Turnstile
- Consultation verification: short-lived email OTP

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Copy environment examples:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

3. Start MongoDB locally or replace `MONGODB_URI` with a MongoDB Atlas connection string.

4. Run the website and API:

```bash
npm run dev
```

- Website: `http://localhost:5173`
- API health: `http://localhost:5000/api/health`
- Secure admin panel: `http://localhost:5173/admin`

Development uses Cloudflare Turnstile test keys and can display the OTP in the consultation modal. Production never returns the OTP.

## Secure Admin Panel

The admin panel lets the company owner:

- View every verified consultation request
- Search clients by name, email, phone, or service
- Filter by requested service and follow-up status
- Open full client contact details and messages
- Update status to New, Contacted, In Progress, or Completed
- Save private follow-up notes

Generate a strong admin password and its secure scrypt hash:

```bash
cd server
npm run admin:generate
```

Store the generated password in a password manager. Put only the generated hash in `ADMIN_PASSWORD_HASH`. Also configure `ADMIN_EMAIL` and a long random `ADMIN_SESSION_SECRET`.

The admin login includes a forgot-password flow. Reset links:

- Are sent only to the configured `ADMIN_EMAIL`
- Use one-time random tokens stored only as SHA-256 hashes
- Expire after 15 minutes through a MongoDB TTL index
- Invalidate every active admin session after a successful reset
- Store the new scrypt password hash in MongoDB while retaining `ADMIN_PASSWORD_HASH` as the initial fallback

Admin sessions:

- Use random tokens stored only as SHA-256 hashes in MongoDB
- Use HttpOnly, SameSite=Strict cookies
- Are bound to the browser user-agent
- Expire automatically after eight hours through a MongoDB TTL index
- Require a separate CSRF token for status, note, and logout actions
- Send `Cache-Control: no-store` on every admin API response
- Rate-limit login attempts

## Production Configuration

Set these secrets before deploying:

- `MONGODB_URI`
- `CLIENT_ORIGINS`
- `TURNSTILE_SECRET_KEY`
- `OTP_PEPPER`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `ADMIN_RESET_URL` (for example `https://example.com/admin`)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `CONSULTANT_EMAIL`
- `NODE_ENV=production`
- `TRUST_PROXY=true` when deployed behind a trusted reverse proxy

Build the frontend and start the API:

```bash
npm run build
npm start
```

The Express server automatically serves `client/dist` when it exists.

## Security Decisions

- Visitors do not create accounts or passwords.
- Consultation submission requires server-validated Cloudflare Turnstile and an email OTP.
- OTP values are HMAC-hashed, expire after 10 minutes, and are automatically removed using a MongoDB TTL index.
- OTP verification is limited to five attempts.
- OTP requests, consultation submissions, and all API traffic are rate-limited.
- A honeypot field quietly absorbs basic automated form spam.
- Request bodies and all form fields have strict size limits and schema validation.
- CORS accepts only configured frontend origins.
- HTTP security headers are enabled through Helmet.
- Duplicate consultation requests from one email are blocked for five minutes.

Email syntax checks cannot prove that an inbox exists. OTP verification is used because successful code entry proves the visitor can access that mailbox.

The included rate limiter uses process memory, which is suitable for a single API instance. If the API is scaled across multiple instances, configure a shared Redis-backed rate-limit store so abuse limits remain consistent across every instance.

## Before Going Live

1. Create a Cloudflare Turnstile widget for the live domain.
2. Configure a transactional SMTP provider. Do not use a personal email password.
3. Create MongoDB Atlas database credentials with only the permissions this application needs.
4. Configure environment secrets in the hosting platform, never in Git.
5. Enable HTTPS and test the complete OTP flow on the live domain.
6. Add a privacy policy and define how long consultation records are retained.
