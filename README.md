# TransAIJournaller

Transform your media into actionable insights with AI-powered transcription and analysis.

## Project Overview

TransAIJournaller is a Next.js application that enables users to upload audio and video files, which are then transcribed using a transcription service (AssemblyAI), analyzed with an LLM (Gemini 2.5 Pro), and the extracted insights are stored in Google Sheets.

## Next.js Application Structure

This project uses Next.js 15 with the App Router architecture. Here's an explanation of the folder structure:

```
trans-ai-journaller/
├── src/
│   ├── app/                 # App Router main directory
│   │   ├── page.tsx         # Home/landing page (/)
│   │   ├── layout.tsx       # Root layout for all pages
│   │   ├── globals.css      # Global CSS styles
│   │   ├── login/           # Login page (/login)
│   │   │   └── page.tsx     # Login page component
│   │   ├── dashboard/       # Dashboard page (/dashboard)
│   │   │   └── page.tsx     # Dashboard component (protected)
│   │   └── api/             # API Routes
│   │       ├── auth/        # Authentication endpoints
│   │       ├── upload/      # File upload API
│   │       ├── transcribe/  # Transcription API
│   │       ├── summarize/   # LLM processing API
│   │       └── sheets/      # Google Sheets integration API
│   ├── utils/               # Utility functions
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── transcription.ts # Transcription service wrapper
│   │   ├── llm.ts           # LLM API wrapper
│   │   └── googleSheets.ts  # Google Sheets utilities
│   └── middleware.ts        # Next.js middleware for route protection
├── public/                  # Static assets
├── flake.nix                # Nix flake configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Node dependencies
└── tsconfig.json            # TypeScript configuration
```

### Key Components

#### App Router

Next.js 13+ introduced the App Router, a file-system based router that supports:

- **Layouts**: Shared UI across multiple pages (src/app/layout.tsx)
- **Nested Routes**: Create routes by nesting folders inside src/app
- **API Routes**: Server-side API endpoints in the src/app/api directory

#### Routes and Pages

- **Routes are defined by folders**: Each folder in src/app corresponds to a route segment
- **Pages are defined by page.tsx**: Special files that export React components
- **Layouts with layout.tsx**: Share UI between multiple pages

#### Client and Server Components

Next.js components are server components by default, which:

- Render on the server
- Can access server resources directly
- Can't use hooks or browser APIs

To use client-side functionality (like state or effects), add 'use client' at the top of the file:

```typescript
"use client";

import { useState, useEffect } from "react";
```

#### API Routes

API Routes in src/app/api allow you to create serverless functions that run on the server. Each API route is defined by a route.ts file that exports handler functions like:

```typescript
export async function GET(request: NextRequest) {
  // Handle GET request
}

export async function POST(request: NextRequest) {
  // Handle POST request
}
```

#### Middleware

The middleware.ts file contains logic that runs before a request is completed. In this project, it's used for authentication - protecting routes and redirecting unauthenticated users.

## Authentication Flow

1. User enters credentials on the login page
2. Credentials are sent to /api/auth
3. Server validates credentials and issues a JWT token as an HTTP-only cookie
4. Middleware checks protected routes for valid tokens
5. API routes also verify authentication before processing requests

## Media Processing Flow

1. User uploads a file on the dashboard
2. File is sent to /api/upload endpoint
3. Upload endpoint saves the file and returns the file path
4. File path is sent to /api/transcribe for transcription
5. Transcription is sent to /api/summarize for LLM processing
6. Extracted insights are sent to /api/sheets to save in Google Sheets
7. Results are displayed to the user

## Getting Started

### Prerequisites

- Node.js 20+
- Nix (for development environment)
- API keys for:
  - AssemblyAI (or alternative transcription service)
  - Gemini (or alternative LLM)
  - Google Sheets API credentials
  - Stripe API for payment processing

### Environment Variables

Create a `.env` file with:

```
# Authentication
JWT_SECRET=your-secure-jwt-secret
AUTH_USERNAME=your-admin-username
AUTH_PASSWORD=your-admin-password

# Transcription Service
ASSEMBLYAI_API_KEY=your-assemblyai-api-key

# LLM Processing
GEMINI_API_KEY=your-gemini-api-key

# Google Sheets
GOOGLE_CLIENT_EMAIL=your-google-service-account-email
GOOGLE_PRIVATE_KEY=your-google-service-account-private-key
SPREADSHEET_ID=your-google-spreadsheet-id

# Stripe Payment Processing
STRIPE_API_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-signing-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Stripe Configuration

To set up the Stripe integration:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. In the Stripe Dashboard, get your API keys from Developers → API keys
3. Set up a webhook endpoint in Developers → Webhooks:
   - URL: `{NEXT_PUBLIC_BASE_URL}/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Get the webhook signing secret and add it to your .env file
5. Create a product and price in the Stripe Dashboard for your subscription

### Running the Application

With Nix:

```bash
nix develop
yarn install
yarn dev
```

Without Nix:

```bash
yarn install
yarn dev
```

Visit http://localhost:3000 to use the application.

## Connect

- [YouTube](https://youtube.com/channel/UCji0gg2Vbq16XWxlVn0KygA)
- [Twitter](https://x.com/avinistore)
- [GitHub](https://github.com/ce20480)
