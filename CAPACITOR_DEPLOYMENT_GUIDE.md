# Capacitor Mobile App Deployment Guide

This guide will help you build and deploy your Junub-hockup app to Android and iOS app stores.

## Prerequisites

### For Android Development
- **Android Studio** (latest version)
- **Java Development Kit (JDK) 17** or higher
- **Android SDK** (installed via Android Studio)

### For iOS Development (macOS only)
- **Xcode** (latest version from Mac App Store)
- **iOS Simulator** (comes with Xcode)
- **Apple Developer Account** (for App Store deployment)

## Initial Setup (Already Done)

✅ Capacitor is already installed and configured in your project:
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`
- `capacitor.config.ts` is configured
- Android and iOS projects are initialized

## Build Commands

### 1. Build for Development/Testing
```bash
# Build the web app and sync with native projects
npm run cap:build

# Open Android Studio for Android development
npm run cap:android

# Open Xcode for iOS development (macOS only)
npm run cap:ios
```

### 2. Production Build
```bash
# Build for production
npm run build

# Sync the build with native projects
npm run cap:sync
```

## Android Deployment

### Step 1: Configure App Signing
1. Open Android Studio
2. Go to `Build` → `Generate Signed Bundle / APK`
3. Create a new keystore or use existing one
4. Save keystore details securely

### Step 2: Build Release APK/AAB
```bash
# In Android Studio terminal or project root
cd android
./gradlew assembleRelease  # For APK
./gradlew bundleRelease    # For AAB (recommended for Play Store)
```

### Step 3: Testing Distribution Options

#### Option A: Firebase App Distribution (Recommended for Testing)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init`
4. Upload APK: `firebase appdistribution:distribute app/build/outputs/apk/release/app-release.apk --app YOUR_FIREBASE_APP_ID`

#### Option B: Google Play Console (Internal Testing)
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Upload AAB file to Internal Testing
4. Add test users
5. Get shareable link

### Step 4: Update GetApp Component
Update the Android URL in `src/components/GetApp.tsx`:
```typescript
const APP_STORE_URLS = {
  // Replace with your actual links
  ANDROID: 'https://play.google.com/store/apps/details?id=com.junubhockup.app',
  // Or for Firebase App Distribution:
  ANDROID_TEST: 'https://appdistribution.firebase.dev/i/YOUR_FIREBASE_LINK',
};
```

## iOS Deployment

### Step 1: Configure App in Xcode
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select your development team
3. Configure bundle identifier: `com.junubhockup.app`
4. Set deployment target (iOS 13.0+)

### Step 2: Build for Testing

#### Option A: TestFlight (Recommended)
1. Archive the app: `Product` → `Archive`
2. Upload to App Store Connect
3. Add to TestFlight
4. Create public link or add specific testers

#### Option B: Ad Hoc Distribution
1. Create Ad Hoc provisioning profile
2. Archive and export with Ad Hoc profile
3. Distribute IPA file directly

### Step 3: Update GetApp Component
Update the iOS URL in `src/components/GetApp.tsx`:
```typescript
const APP_STORE_URLS = {
  // Replace with your TestFlight link
  IOS: 'https://testflight.apple.com/join/YOUR_TESTFLIGHT_CODE',
  // Or App Store link when published:
  // IOS: 'https://apps.apple.com/app/junub-hockup/idYOUR_APP_ID',
};
```

## App Store Assets

### Required Assets
1. **App Icon**: 1024x1024px (for both platforms)
2. **Splash Screen**: Various sizes
3. **Screenshots**: Different device sizes
4. **App Description**: Store listing content

### Update App Icons
- Replace icons in `android/app/src/main/res/mipmap-*` folders
- Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## Environment Configuration

### Production Environment Variables
Create `.env.production`:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
```

### Capacitor Configuration Updates
Update `capacitor.config.ts` for production:
```typescript
const config: CapacitorConfig = {
  appId: 'com.junubhockup.app',
  appName: 'Junub-hockup',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Remove or comment out for production
    // url: 'http://localhost:5173',
    // cleartext: true
  },
  // Add production-specific plugins configuration
};
```

## Testing Checklist

### Before Release
- [ ] Test all app features on physical devices
- [ ] Verify push notifications work
- [ ] Test offline functionality
- [ ] Check app performance
- [ ] Verify deep links work
- [ ] Test app store compliance

### App Store Requirements
- [ ] Privacy policy URL
- [ ] Terms of service
- [ ] App store screenshots
- [ ] App description and keywords
- [ ] Age rating classification

## Deployment Commands Summary

```bash
# Development
npm run dev                 # Web development
npm run cap:android        # Open Android Studio
npm run cap:ios           # Open Xcode

# Production Build
npm run build             # Build web app
npm run cap:sync         # Sync with native projects

# Capacitor Utilities
npx cap sync             # Sync web assets and plugins
npx cap update           # Update Capacitor and plugins
npx cap doctor           # Check Capacitor setup
```

## Troubleshooting

### Common Issues
1. **Build Errors**: Check `npx cap doctor` for configuration issues
2. **Plugin Issues**: Ensure all plugins are properly installed
3. **Signing Issues**: Verify certificates and provisioning profiles
4. **Performance**: Optimize bundle size and lazy loading

### Useful Commands
```bash
# Clean and rebuild
npx cap sync --force
npm run build && npx cap sync

# Check Capacitor configuration
npx cap doctor

# Update Capacitor
npx cap update
```

## Next Steps

1. **Set up CI/CD**: Automate builds with GitHub Actions or similar
2. **Analytics**: Add app analytics (Firebase Analytics, etc.)
3. **Crash Reporting**: Implement crash reporting (Sentry, Crashlytics)
4. **Performance Monitoring**: Monitor app performance
5. **User Feedback**: Implement in-app feedback system

## Support Links

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/distribute)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/guidelines/)
- [Firebase App Distribution](https://firebase.google.com/docs/app-distribution)

---

Your app is now ready for mobile deployment! Update the URLs in the GetApp component once you have your actual store/test links.
