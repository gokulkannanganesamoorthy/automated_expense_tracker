# Architecture & Infrastructure

## Overview
Automated Expense Tracker is an investor-grade fintech application built with React Native (Expo) and Next.js. It features offline-first local persistence, a resilient cloud sync engine, and an intelligent SMS parsing architecture.

## Tech Stack
### Mobile Application
- **Framework**: React Native (Expo SDK 51)
- **Language**: TypeScript (Strict Mode)
- **State Management**: Zustand
- **Local Persistence**: Expo SQLite
- **Visuals/Charts**: React Native Skia
- **Animations**: Reanimated v3

### Admin Dashboard
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Lucide React, Recharts

### Backend & Cloud (Firebase)
- **Authentication**: Firebase Auth (OAuth integrations)
- **Database**: Cloud Firestore
- **Functions**: Firebase Cloud Functions (Insights, Data processing)
- **Dynamic Engine**: Firebase Remote Config (Regex parsing engine updates)

## Key Systems

### 1. The Sync Engine
Located in `apps/mobile/src/services/sync.ts`.
Implements an offline-first strategy:
- All transactions are written locally to SQLite first to ensure the UI is unblocked.
- A background process pushes changes to Firestore using batch writes.
- Remote changes are pulled using a cursor based on the `_serverUpdatedAt` timestamp to ensure efficient syncs across multiple devices.

### 2. SMS Parsing Orchestrator
Located in `apps/mobile/src/services/parser-orchestrator.ts`.
- Reads SMS locally on device (privacy-preserving).
- Uses Regex patterns downloaded dynamically via Firebase Remote Config to parse specific banks without requiring App Store updates.
- Assigns a confidence score. High confidence transactions are auto-categorized; low confidence transactions are sent to the Review Queue.

### 3. Tenant Isolation
Firestore security rules enforce strict row-level security using the `isOwner` predicate, guaranteeing users can only read or modify their own collections (`transactions`, `budgets`, `settings`).
