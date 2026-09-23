# Password-reset setup

Copy the relevant settings from `.env.example` into your local `.env`. Keep credentials out of Git.

## Local development

Use `MAIL_TRANSPORT=console` and `APP_URL=http://localhost:3000`. Run `npm run dev`, open `/forgot-password`, and submit an existing active account's email. A reset link appears in the server terminal. Console mode does not send email and is rejected in production.

The application needs a real `DATABASE_URL` and `JWT_ACCESS_SECRET` for live authentication. Build checks using a placeholder database URL do not verify the database.

## SMTP delivery

Set `MAIL_TRANSPORT=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` using your email provider's values. Set `APP_URL` to your public HTTPS application origin. Use the provider's verified sender address for `SMTP_FROM`.

For port 587, use `SMTP_SECURE=false`; STARTTLS is required. For port 465, use `SMTP_SECURE=true` for immediate TLS. Certificate verification remains enabled. See [Nodemailer SMTP configuration](https://nodemailer.com/smtp).

Restart the application after changing environment settings. Do not configure console mode for `npm run start`, which runs in production mode.

Reset links expire after one hour. Successful reset consumes the token and invalidates other reset tokens and active sessions. The response intentionally does not confirm whether an email address exists. SMTP acceptance is not proof of inbox delivery; check the provider's delivery records if messages do not arrive.

## Checks

Run `npm run test:auth` and `npm run typecheck` from `frontend`. Email tests mock the mail transport and do not send email. Live delivery must be tested separately after the database and SMTP settings are configured.
