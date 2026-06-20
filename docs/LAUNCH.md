# Launch Guide

This document outlines the steps required to deploy the Automated Expense Tracker to production.

## 1. Firebase Production Environment
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com).
2. Enable Authentication (Google, Apple, Email).
3. Provision Firestore Database and deploy the `firestore.rules`.
4. Deploy Cloud Functions:
   ```bash
   cd apps/functions
   npm run deploy
   ```
5. Populate Remote Config with the initial `bank_patterns` JSON configuration.

## 2. Mobile App (Expo / EAS)
1. Ensure all environment variables are set in `.env.production`.
2. Configure App Store and Play Store credentials in EAS.
3. Build the production binaries:
   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   eas build --platform ios --profile production
   ```
4. Submit to stores:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

## 3. Admin Dashboard (Vercel)
1. Link the `apps/web` directory to a Vercel project.
2. Set the necessary environment variables in the Vercel dashboard.
3. Deploy to production via the GitHub integration or Vercel CLI.

## 4. Post-Launch Monitoring
- Monitor crash reports via Firebase Crashlytics.
- Watch the Admin Dashboard for sudden drops in parse confidence, which may indicate a bank changed their SMS format.
- Adjust Remote Config patterns immediately if SMS parsing issues are detected.
