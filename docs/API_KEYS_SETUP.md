# API Keys & Third-Party Integrations Setup Guide

To get the Automated Expense Tracker ready for production, you need to configure several API keys and external services. Follow this step-by-step guide to retrieve the necessary credentials.

## 1. Firebase (Auth, Firestore, Cloud Functions, Remote Config)

Firebase is the backbone of your application.

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `ExpenseTrackerPro`).
3. Enable **Google Analytics** (recommended for Crashlytics).
4. Click **Create Project**.

### Step 2: Register your Apps
1. **iOS App**: Click the iOS icon (`</>`), enter your iOS Bundle ID (e.g., `com.gokulkannan.expensetracker`), and register. Download the `GoogleService-Info.plist` and place it in the `apps/mobile/` directory.
2. **Android App**: Click the Android icon, enter your Android Package Name, and register. Download the `google-services.json` and place it in the `apps/mobile/` directory.
3. **Web App (Admin Dashboard)**: Click the Web icon (`</>`). You will be provided with a `firebaseConfig` object containing your Web API keys.

### Step 3: Populate `.env` files
Create an `.env` file in `apps/mobile` and `apps/web` using your Web API configuration:
```env
EXPO_PUBLIC_FIREBASE_API_KEY="your_api_key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
EXPO_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

---

## 2. Google OAuth (for Authentication)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your Firebase project.
3. Go to **APIs & Services > Credentials**.
4. You will see Web, iOS, and Android OAuth 2.0 Client IDs created by Firebase.
5. Provide these Client IDs to the `expo-auth-session` configuration in `apps/mobile/src/services/auth.ts` (if required by your Google Sign-in flow).

---

## 3. Apple OAuth (for Authentication on iOS)

1. Go to the [Apple Developer Portal](https://developer.apple.com/).
2. Navigate to **Certificates, Identifiers & Profiles > Identifiers**.
3. Ensure your App ID has the **Sign In with Apple** capability enabled.
4. Go to **Keys** and create a new key for **Sign in with Apple**. Download the `.p8` file.
5. In the [Firebase Console](https://console.firebase.google.com/), go to **Authentication > Sign-in method > Apple**, and input the Service ID, Team ID, Key ID, and upload the `.p8` file.

---

## 4. Vercel (For Deploying Admin Dashboard)

If you are using Vercel and GitHub Actions, you need tokens to automate deployments.

1. Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens).
2. Create a new token named `GITHUB_ACTION_TOKEN`.
3. Go to your Vercel Project settings and copy the `Project ID` and `Org ID`.
4. In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:
   - `VERCEL_TOKEN`: (Your Token)
   - `VERCEL_ORG_ID`: (Your Org ID)
   - `VERCEL_PROJECT_ID`: (Your Project ID)

---

## 5. Expo Application Services (EAS) Token

To automatically build your React Native app via GitHub actions:

1. Go to [Expo Access Tokens](https://expo.dev/settings/access-tokens).
2. Create a new token.
3. In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:
   - `EXPO_TOKEN`: (Your Expo Token)

Once you've filled in all of these keys, your app is fully ready for production deployment!
