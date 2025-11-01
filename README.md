## Planning Poker for Agile Teams

This repository hosts a collaborative Planning Poker web app built with Next.js, React, and Tailwind CSS. The tool lets product teams estimate work together in real time:

- Spin up lightweight rooms for each estimation session.
- Invite others with a shareable `/join` link; each participant keeps their identity in-browser.
- Choose between Fibonacci and T‑Shirt sizing decks.
- Pick cards privately, then mark yourself “Ready.” Votes reveal automatically when everyone is ready, or a facilitator can reveal/reset manually.
- Round resets, strategy changes, and departures update instantly for every client (polled every 3 seconds).

State is stored in-process for simplicity—great for demos and small teams. For production you’d back it with a shared datastore (Redis, Postgres, etc.) so rooms survive restarts and multiple server instances.

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
