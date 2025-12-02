# Android Build Guide

Complete guide to building and deploying the Lukudiplomi Android app.

## Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18 or higher
   ```

2. **Expo CLI & EAS CLI**
   ```bash
   npm install -g expo-cli eas-cli
   ```

3. **Android Studio** (Optional, for emulator)
   - Download from https://developer.android.com/studio
   - Install Android SDK
   - Install Android Emulator

### Expo Account

1. Create free account at https://expo.dev
2. Login via CLI:
   ```bash
   eas login
   ```

## Development Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure API URL

Edit `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://10.0.2.2:3000/api"  // For emulator
      // OR
      "apiUrl": "http://192.168.1.100:3000/api"  // For physical device
    }
  }
}
```

### 3. Start Development Server

```bash
npm start
```

## Testing on Physical Android Device

### Method 1: Expo Go App (Easiest)

1. Install "Expo Go" from Google Play Store
2. Ensure phone and computer are on same WiFi
3. Run `npm start`
4. Scan QR code with Expo Go app

**Pros:**
- Instant testing
- No build required
- Fast iteration

**Cons:**
- Limited to Expo SDK modules
- Cannot test native modules

### Method 2: Development Build

1. Build development APK:
   ```bash
   eas build --platform android --profile development
   ```

2. Download and install APK on device

3. Run dev server:
   ```bash
   npm start --dev-client
   ```

## Testing on Android Emulator

### Setup Emulator

1. Open Android Studio
2. Tools → Device Manager
3. Create Virtual Device
4. Select device (e.g., Pixel 6)
5. Select system image (Android 13 recommended)
6. Finish setup

### Run on Emulator

```bash
npm run android
```

This will:
- Start emulator if not running
- Install app on emulator
- Start Metro bundler
- Open app

## Building for Production

### Step 1: Configure EAS

First time only:
```bash
cd mobile
eas build:configure
```

This creates `eas.json` configuration file.

### Step 2: Update Version

In `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

Increment for each release:
- `version`: Human-readable (1.0.0 → 1.0.1)
- `versionCode`: Integer for Play Store (1 → 2)

### Step 3: Build APK

**For testing (APK):**
```bash
eas build --platform android --profile preview
```

**For Play Store (AAB):**
```bash
eas build --platform android --profile production
```

### Step 4: Download Build

1. Build completes in 10-15 minutes
2. Get download link from terminal
3. Or check https://expo.dev

### Build Profiles

**Development:**
- Includes dev tools
- Connects to Metro bundler
- For testing native modules

**Preview:**
- APK format
- Optimized but not fully
- Easy to share for testing

**Production:**
- AAB format (Android App Bundle)
- Fully optimized
- For Google Play Store
- Smaller download size

## Local APK Build (Alternative)

Using Expo's local build (slower):

```bash
# Requires Android SDK and JDK
npx expo run:android --variant release
```

## Code Signing

### Generate Keystore

Expo handles automatically, but for manual builds:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore lukudiplomi-release.keystore \
  -alias lukudiplomi-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

Store securely! Never commit to git.

## Publishing to Google Play Store

### Prerequisites

1. **Google Play Developer Account**
   - Cost: $25 (one-time)
   - Register at https://play.google.com/console

2. **App Assets Required:**
   - App icon (512×512 px)
   - Feature graphic (1024×500 px)
   - Screenshots (at least 2, up to 8)
   - Privacy policy URL
   - App description

### Step 1: Create App in Play Console

1. Go to Google Play Console
2. Click "Create app"
3. Fill in:
   - App name: Lukudiplomi
   - Default language: English
   - App/Game: App
   - Free/Paid: Free
4. Accept declarations

### Step 2: Complete Store Listing

**Required information:**
- Short description (80 chars max)
- Full description (4000 chars max)
- App icon
- Feature graphic
- Screenshots (phone, 7-inch tablet, 10-inch tablet)
- Content rating questionnaire
- Privacy policy URL

### Step 3: Build Production AAB

```bash
eas build --platform android --profile production
```

### Step 4: Upload AAB

1. In Play Console: Production → Releases
2. Create new release
3. Upload AAB file
4. Add release notes
5. Save release

### Step 5: Submit for Review

1. Complete all sections
2. Submit for review
3. Wait 1-7 days for approval

## Automated Submission (EAS Submit)

After building AAB:

```bash
eas submit --platform android
```

Requires:
- Google Service Account JSON key
- Configured in `eas.json`

## Over-the-Air Updates (OTA)

Update app without rebuilding:

### Publish Update

```bash
eas update --branch production --message "Bug fixes"
```

### Users Receive Update

- On next app restart
- Automatic download
- Works for JS/React changes only
- Native changes require new build

## App Signing

### Configure in eas.json

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "credentialsSource": "local"
      }
    }
  }
}
```

### Manage Credentials

```bash
eas credentials
```

Options:
- View keystore
- Download keystore
- Delete credentials
- Upload custom keystore

## Testing Checklist

Before releasing:

- [ ] Test login flow
- [ ] Test book logging
- [ ] Test navigation
- [ ] Test on slow network
- [ ] Test offline behavior
- [ ] Test on different screen sizes
- [ ] Test on Android 5, 7, 10, 13
- [ ] Verify API connections
- [ ] Check app permissions
- [ ] Test deep linking
- [ ] Verify crash reporting
- [ ] Check app size (<50MB ideal)

## Optimization

### Reduce APK Size

1. **Enable Proguard** (already configured):
   ```json
   "android": {
     "enableProguardInReleaseBuilds": true,
     "enableShrinkResourcesInReleaseBuilds": true
   }
   ```

2. **Optimize images:**
   - Use WebP format
   - Compress with TinyPNG

3. **Remove unused dependencies:**
   ```bash
   npx depcheck
   ```

### Performance

1. **Enable Hermes** (already configured in app.json)

2. **Profile performance:**
   ```bash
   npx react-native run-android --variant=release
   adb shell am start -n com.lukudiplomi.app/.MainActivity --es perf true
   ```

## Troubleshooting

### Build Fails

**Check logs:**
```bash
eas build:list
eas build:view BUILD_ID
```

**Common fixes:**
- Clear Expo cache: `expo start --clear`
- Update dependencies: `npm update`
- Check eas.json configuration

### App Crashes on Startup

1. Check logs:
   ```bash
   adb logcat *:E
   ```

2. Verify API URL in app.json

3. Check for missing dependencies

### Can't Install APK

1. Enable "Install from Unknown Sources"
2. Check minimum SDK version (21 = Android 5.0)
3. Verify signing certificate

### Slow Build Times

- EAS builds: 10-20 minutes (normal)
- Local builds: 5-10 minutes
- Use `--local` flag for local builds

## Monitoring

### Crash Reporting

Add Sentry or similar:

```bash
npm install @sentry/react-native
```

```javascript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
});
```

### Analytics

Add Expo Analytics or Google Analytics:

```bash
npx expo install expo-firebase-analytics
```

## Distribution

### Internal Testing

1. Google Play Console → Testing → Internal testing
2. Create release
3. Add testers by email
4. Share internal testing link

### Beta Testing

1. Testing → Closed testing
2. Create track (e.g., "Beta")
3. Add testers or use email list
4. Promote from internal when ready

### Production Release

1. Promote from closed testing
2. Or create production release
3. Rollout percentage (start with 10%, increase gradually)

## Version Management

### Semantic Versioning

```
MAJOR.MINOR.PATCH
1.0.0 → 1.0.1 (bug fix)
1.0.1 → 1.1.0 (new feature)
1.1.0 → 2.0.0 (breaking change)
```

### Update Process

1. Increment versions in app.json
2. Update CHANGELOG.md
3. Build new version
4. Test thoroughly
5. Submit to Play Store
6. Monitor for crashes

## Resources

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Google Play Console: https://play.google.com/console
- React Native: https://reactnative.dev
- Android Developers: https://developer.android.com

## Support

For build issues:
1. Check EAS build logs
2. Search Expo forums
3. Check project GitHub issues
4. Contact support

---

**Ready to build?** Start with:
```bash
npm run build:android:preview
```

Then test the APK before submitting to Play Store!
