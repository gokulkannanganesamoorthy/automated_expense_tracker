# Automated Expense Tracker

An investor-grade fintech product designed to securely parse financial SMS alerts, manage split expenses, track budgets, and synchronize seamlessly across devices via Firebase.

## Project Structure
This is a standard Turborepo-style monorepo structure:
- `apps/mobile`: React Native (Expo SDK 51) app for iOS & Android.
- `apps/web`: Next.js Admin Dashboard for tracking metrics.
- `apps/functions`: Firebase Cloud Functions for backend insights and user initialization.
- `packages/shared`: Shared types, Zod validators, and constants used across applications.

## Key Features
- **Offline-First Sync Engine**: Transactions are written to local SQLite first to ensure the UI is snappy, then pushed to Firestore in the background using batch writes and cursor-based timestamp merges.
- **Dynamic SMS Parsing**: Parsing rules are synced dynamically from Firebase Remote Config, meaning you can update Regex patterns for new banks without releasing an App Store update.
- **Skia-based Analytics**: High-performance visualizations for budgets and spending categories using `@shopify/react-native-skia`.
- **Tenant Isolation**: Strict Firestore security rules ensure data privacy.
- **Split Expenses**: Built-in split expense module to manage IOUs among friends.

## Getting Started
Please see `docs/LAUNCH.md` for detailed instructions on deploying the environment and binaries.
