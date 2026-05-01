# FinRatio

FinRatio is a Next.js financial analysis app for business credit and ratio-based calculations. It includes authentication, a protected dashboard, calculator workflows, PDF export support, and AI-assisted analysis.

## Features

- Landing page with login-aware call to action
- Email OTP sign-up and sign-in flow
- Protected dashboard and calculator pages
- Debt-equity and DSCR calculator views
- Calculation history stored through Prisma
- AI analysis endpoint for credit insights
- PDF generation utilities for reports

## Tech Stack

- Next.js 14 with the App Router
- React 18 and TypeScript
- Tailwind CSS
- Prisma with SQLite or Turso-compatible LibSQL configuration
- JWT cookie-based session handling

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file and set the required values:

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"
TURSO_DATABASE_URL=""
TURSO_AUTH_TOKEN=""
OPENROUTER_API_KEY=""
RESEND_API_KEY=""
```

3. Run Prisma generation if needed:

```bash
npx prisma generate
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - build the app for production
- `npm run start` - run the production build
- `npm run lint` - run ESLint

## Notes

- The local SQLite database lives in `prisma/dev.db`.
- Authentication routes are under `app/auth` and `app/api/auth`.
- Protected routes include `/dashboard` and `/calculator`.
- For Vercel, set `DATABASE_URL`, `JWT_SECRET`, `OPENROUTER_API_KEY`, and `RESEND_API_KEY` in the project environment settings.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
