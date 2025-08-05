# Contentoire Mobile App Setup

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google OAuth Configuration
GOOGLE_EXPO_CLIENT_ID=your_expo_client_id
GOOGLE_IOS_CLIENT_ID=your_ios_client_id
GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
GOOGLE_WEB_CLIENT_ID=your_web_client_id

# Sentry Configuration (optional)
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## Issues Fixed

- ✅ Removed deprecated `expo-router/babel` plugin
- ✅ Fixed Firebase photoURL undefined error
- ✅ Fixed Sentry initialization warning
- ✅ Simplified routing structure
- ✅ Added proper error handling for missing environment variables

## App Structure

- `app/index.tsx` - Main entry point with auth routing
- `app/_layout.tsx` - Root layout with navigation setup
- `app/(tabs)/` - Tab-based navigation screens
- `app/login.tsx` - Authentication screen
- `hooks/useAuth.ts` - Authentication logic
- `config/firebase.ts` - Firebase configuration

## Features

- Firebase Authentication
- Firestore for data storage
- Tab-based navigation
- Dark/Light theme support
- Error boundary with Sentry integration
- Post scheduling functionality 