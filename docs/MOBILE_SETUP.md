# Mobile App Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- For Android: Android Studio and Android SDK
- For iOS: Xcode (macOS only)
- Backend API running

## Installation

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://your-backend-url:3000/api"
    }
  }
}
```

For local development on Android emulator, use:
- `http://10.0.2.2:3000/api` (Android Emulator)
- `http://localhost:3000/api` (iOS Simulator)

## Running the App

### Start Expo development server:
```bash
npm start
```

### Run on Android:
```bash
npm run android
```

### Run on iOS (macOS only):
```bash
npm run ios
```

### Run in web browser:
```bash
npm run web
```

## Using Expo Go

1. Install Expo Go on your device:
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with:
   - Android: Expo Go app
   - iOS: Camera app

## Building for Production

### Android APK:
```bash
npm run build:android
```

### iOS IPA (requires Apple Developer account):
```bash
eas build --platform ios
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/      # Screen components
│   ├── components/   # Reusable components
│   ├── navigation/   # Navigation configuration
│   ├── services/     # API and services
│   ├── stores/       # State management
│   └── utils/        # Utility functions
├── assets/           # Images, fonts, etc.
├── App.js           # Entry point
└── app.json         # Expo configuration
```

## Features

### Authentication
- Email/password login
- OAuth integration
- Secure token storage

### Student Features
- Dashboard with reading stats
- Book logging
- Achievement viewing
- Profile management

### Teacher Features
- Class overview
- Student alerts
- Activity monitoring

## Troubleshooting

### Metro bundler errors
```bash
expo start --clear
```

### Android build fails
- Ensure Android SDK is installed
- Check ANDROID_HOME environment variable
- Run `expo doctor` to diagnose issues

### iOS build fails (macOS)
- Ensure Xcode is installed
- Run `pod install` in ios directory
- Check code signing settings

### API connection fails
- Verify API URL in app.json
- Check network connectivity
- For Android emulator, use 10.0.2.2 instead of localhost
- Ensure backend allows CORS from mobile app

### Expo Go app not loading
- Ensure phone and computer are on same network
- Disable firewall temporarily
- Try tunnel connection: `expo start --tunnel`
