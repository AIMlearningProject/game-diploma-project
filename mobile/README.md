# Lukudiplomi Mobile App (Android & iOS)

React Native app built with Expo for the Lukudiplomi Reading Diploma Game.

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli eas-cli`
- For Android development: Android Studio
- For testing: Expo Go app on your phone

### Installation

```bash
npm install
```

### Development

**Start development server:**
```bash
npm start
```

**Run on Android emulator:**
```bash
npm run android
```

**Run on physical device:**
1. Install Expo Go from Google Play Store
2. Run `npm start`
3. Scan QR code with Expo Go

### Configuration

Edit `app.json` to change:
- App name
- App icon
- Splash screen
- API URL in `extra.apiUrl`

For local backend testing:
- Android Emulator: `http://10.0.2.2:3000/api`
- Physical device: `http://YOUR_COMPUTER_IP:3000/api`

## Building for Android

### Build APK (for testing)

```bash
eas build --platform android --profile preview
```

### Build for Google Play Store

```bash
eas build --platform android --profile production
```

## App Structure

```
mobile/
├── src/
│   ├── screens/           # App screens
│   │   ├── LoginScreen.js
│   │   ├── StudentDashboardScreen.js
│   │   ├── TeacherDashboardScreen.js
│   │   ├── BookLogScreen.js
│   │   ├── GameScreen.js
│   │   └── ProfileScreen.js
│   ├── services/          # API and services
│   │   └── api.js
│   ├── stores/            # State management
│   │   └── authStore.js
│   └── components/        # Reusable components
├── App.js                 # Entry point
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Features

### Student Features
- ✅ Login/Register
- ✅ Dashboard with reading stats
- ✅ Book search and logging
- ✅ Reading history
- ✅ Achievement viewing
- ✅ Profile management
- ✅ Pull-to-refresh

### Teacher Features
- ✅ Class overview
- ✅ Student alerts
- ✅ Activity monitoring
- ✅ Reading log verification

### Technical Features
- ✅ Secure authentication
- ✅ Async storage for offline data
- ✅ API integration
- ✅ Navigation system
- ✅ Cross-platform (Android & iOS)
- ✅ Responsive design

## Android-Specific Setup

### Enable Developer Options on Android Device

1. Go to Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back to Settings → Developer Options
4. Enable "USB Debugging"

### Connect Device via WiFi (ADB)

```bash
# On device, enable wireless debugging
adb tcpip 5555
adb connect YOUR_DEVICE_IP:5555
npm run android
```

### Build Standalone APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build APK
eas build --platform android --profile preview
```

The APK will be available for download after build completes.

## Troubleshooting

### Metro bundler not starting
```bash
npm start -- --clear
```

### Android emulator not found
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd YOUR_AVD_NAME
```

### API connection fails
1. Check backend is running
2. Verify API URL in `app.json`
3. For emulator, use `10.0.2.2` instead of `localhost`
4. For physical device, use your computer's local IP
5. Ensure phone and computer are on same network

### Build fails
```bash
# Clear cache
expo start --clear
rm -rf node_modules
npm install

# Check EAS build logs
eas build:list
```

## Publishing

### Google Play Store

1. Create Google Play Developer account ($25 one-time fee)
2. Create app in Play Console
3. Generate service account JSON
4. Build production APK:
   ```bash
   eas build --platform android --profile production
   ```
5. Submit to Play Store:
   ```bash
   eas submit --platform android
   ```

### Over-the-Air Updates (OTA)

Update app without rebuilding:
```bash
eas update --branch production
```

## Environment Variables

Create `.env` file (not committed to git):

```env
API_URL=https://api.lukudiplomi.fi
```

Access in code:
```javascript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig.extra.apiUrl;
```

## Testing

### Test Accounts

After backend seeding:

**Student:**
- Email: student1@lukudiplomi.fi
- Password: student123

**Teacher:**
- Email: maria.teacher@lukudiplomi.fi
- Password: teacher123

## Performance

### Optimize for Android

1. Enable Hermes engine (already configured in app.json)
2. Reduce image sizes
3. Lazy load screens
4. Use FlatList for long lists
5. Memoize heavy components

### Monitor Performance

```bash
# Android performance profiler
npx react-native run-android --variant=release
```

## App Size

Optimized APK size: ~25-30 MB
Installed size: ~40-50 MB

## Minimum Requirements

- Android 5.0 (API 21) or higher
- 50 MB free space
- Internet connection

## Support

For issues, check:
1. Expo documentation: https://docs.expo.dev
2. React Native docs: https://reactnative.dev
3. Project issues: GitHub repository
