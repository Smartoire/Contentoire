# Contentoire Mobile App

A React Native mobile app built with Expo for content scheduling and management.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory with the following variables:
   ```
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

   # Sentry Configuration
   SENTRY_AUTH_TOKEN=your_sentry_auth_token
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
app/
├── _layout.tsx          # Root layout with navigation setup
├── index.tsx            # Main entry point with auth routing
├── login.tsx            # Login screen
└── (tabs)/              # Tab navigation
    ├── _layout.tsx      # Tab layout configuration
    ├── waitingList.tsx  # Posts waiting to be scheduled
    ├── queued.tsx       # Scheduled posts
    ├── feedsList.tsx    # RSS feeds management
    ├── settings.tsx     # App settings
    └── edit-profile.tsx # Profile editing
```

## Features

- **Authentication:** Firebase Auth with email/password and Google Sign-In
- **Content Management:** Schedule and manage posts from RSS feeds
- **Firestore Integration:** Real-time data synchronization
- **Cross-platform:** iOS and Android support
- **Dark/Light Theme:** Automatic theme switching

## Troubleshooting

### Common Issues

1. **App won't start:**
   - Check if all environment variables are set in `.env`
   - Ensure Firebase project is properly configured
   - Clear Metro cache: `npx expo start --clear`

2. **Authentication issues:**
   - Verify Firebase Auth is enabled in your Firebase console
   - Check if Google Sign-In is properly configured
   - Ensure OAuth client IDs are correct

3. **Build errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Expo Router issues:**
   - Ensure `expo-router` is properly installed
   - Check that `"main": "expo-router/entry"` is in package.json
   - Verify app.json has `"expo-router"` in plugins

### Development Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Lint code
npm run lint

# Clear cache and restart
npx expo start --clear
```

## Dependencies

- **Expo SDK 53:** Latest Expo framework
- **Expo Router 5:** File-based routing
- **Firebase:** Authentication and Firestore
- **React Native:** Core mobile framework
- **TypeScript:** Type safety

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
