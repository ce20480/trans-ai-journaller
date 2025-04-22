# Trans AI Journaller Monorepo

A platform to help trans individuals document and reflect on their transition journey with AI-assisted journaling tools.

## Tech Stack at a Glance

- **Web**: Next.js (React 18, TypeScript)
- **Mobile**: Expo + React Native (TypeScript)
- **Shared UI**: Tamagui / React‑Native‑Web (cross‑platform primitives)
- **Package Manager**: pnpm workspaces
- **Linting / Formatting**: ESLint + Prettier
- **CI**: GitHub Actions (see `.github/workflows/`)
- **AI Services**: OpenAI API, Whisper for speech‑to‑text

> **New here?** Skim this list to understand the moving parts before diving into the code.

## Monorepo Structure

This project is organized as a monorepo with the following structure:

```
trans-ai-journaller/
├── apps/
│   ├── web/         # Next.js web application
│   └── mobile/      # Expo mobile application
└── packages/
    └── ui/         # Shared UI components
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies for all workspaces
pnpm install
```

### Quick Start (TL;DR)

```bash
# 1. Clone
git clone https://github.com/your‑org/trans-ai-journaller.git
cd trans-ai-journaller

# 2. Install all dependencies
pnpm install

# 3. Run web and mobile in parallel (requires two terminals)
pnpm dev:web       # → http://localhost:3000
pnpm dev:mobile    # → Expo Dev Tools
```

> **Tip:** Use the Expo Go app on your phone for instant mobile testing.

### Development

#### Web App

```bash
# Start the Next.js web app
pnpm dev:web
```

#### Mobile App

```bash
# Start the Expo development server
pnpm dev:mobile
```

### Building

#### Web App

```bash
# Build the Next.js web app
pnpm build:web
```

#### Mobile App

```bash
# Build the Expo app (requires EAS configuration)
cd apps/mobile
pnpm build
```

## Environment Variables

Create your own `.env` files by copying the provided examples:

```bash
cp apps/web/.env.local.example apps/web/.env.local
cp apps/mobile/.env.example    apps/mobile/.env
```

The most common variables are:

- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL` & `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (for Google One Tap authentication)

### Setting up Google One Tap

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Configure the OAuth consent screen
3. Create OAuth 2.0 credentials (Web application type)
4. Add authorized JavaScript origins for your domains
5. Add the client ID to your environment variables as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
6. In Supabase, enable Google auth provider and configure the same Client ID and Client Secret

## Contributing Guidelines

1. **Feature branches:** feat/short‑description
2. **Commit style:** Conventional Commits (`feat:`, `fix:`, `chore:` …)
3. **Linting:** `pnpm lint --fix` before every PR
4. **Formatting:** Prettier is run automatically on commit via Husky
5. **Tests:** Run `pnpm test` (Jest) and ensure green checks

## Troubleshooting FAQ

| Problem                            | Quick Fix                                          |
| ---------------------------------- | -------------------------------------------------- |
| `ERR_PNPM_RESOLUTION`              | Delete `pnpm-lock.yaml`, run `pnpm install`        |
| Expo client stuck on splash screen | Clear Expo cache: `pnpm expo start -c`             |
| Supabase 401 errors                | Verify `.env` keys and row‑level security policies |

## Deployment

### Web App (Vercel)

The web app is configured for deployment on Vercel through the `vercel.json` file.

### Mobile App (Expo)

The mobile app can be built and deployed using Expo EAS.

## License

[MIT](LICENSE)
