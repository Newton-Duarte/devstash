# DevStash

DevStash is a developer knowledge hub for snippets, prompts, notes, commands, files, images, links, and custom types.

## Getting Started

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Quality Checks

```bash
pnpm test
pnpm lint
pnpm build
```

## Testing Scope

This repo uses Vitest for unit tests.

- Test server-side utilities in `src/lib`.
- Test lightweight server-action logic only when it can be exercised without heavy mocking.
- Do not add component tests in this setup.
- Do not force Prisma, Auth.js runtime, or external-service-heavy unit tests when the value is low.

Use colocated `*.test.ts` files near the code they cover.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for deployment details.
