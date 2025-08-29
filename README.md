# Junub-hockup App

A relationship-focused social networking app designed to help people find their perfect partner through meaningful connections, compatibility matching, and genuine relationship building.

## Features

✅ **Completed Features:**
- Social Feed as default page after login
- Image upload with maximum 3 pictures per post
- Voice recording and playback
- Real-time messaging with unread count badges
- Push notifications setup (requires mobile build)
- Client-side routing with 404 fix
- Mobile-responsive design
- User authentication and profiles

🚧 **In Progress:**
- Push notifications for new posts and messages
- Mobile app builds for Android and iOS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Run the database migrations in order:

```bash
# Run existing migrations first, then:
# 1. Add image support to posts
# 2. Add notifications and unread message counts
```

Apply these migrations in your Supabase dashboard or using the Supabase CLI:
- `supabase/migrations/20250822211940_add_post_images.sql`
- `supabase/migrations/20250822212426_add_notifications.sql`

### 3. Environment Variables

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Development Server

```bash
npm run dev
```

### 5. Mobile App Setup (Optional)

To build the mobile app for Android and iOS:

```bash
# First, remove existing node_modules and reinstall with compatible versions
rm -rf node_modules package-lock.json
npm install

# Build the web app
npm run build

# Add mobile platforms
npx cap add android
npx cap add ios

# Sync the web app with mobile platforms
npx cap sync

# Open in native IDEs
npx cap open android  # Opens Android Studio
npx cap open ios      # Opens Xcode (macOS only)
```

## Key Features Implemented

### 1. Social Feed as Default Page
- Authenticated users are automatically redirected to `/social`
- Landing page shows for non-authenticated users

### 2. Image Upload (Max 3 Pictures)
- Drag and drop interface
- File validation (images only, max 5MB each)
- Preview with remove functionality
- Stored in Supabase Storage

### 3. Push Notifications
- Service worker setup for web notifications
- Capacitor plugins for mobile notifications
- Database triggers for automatic notifications on new posts
- Real-time unread message counts

### 4. Client-Side Routing Fix
- Added `_redirects` file for deployment platforms
- Updated Vite config for SPA routing
- Handles page refreshes correctly

### 5. Messaging System
- Real-time messaging
- Unread message counts with badges
- Message read status tracking
- Mobile-optimized chat interface

## Database Schema

### New Tables Added:
- `post_images` - Individual image records for posts
- `notifications` - User notifications
- `unread_message_counts` - Optimized unread message tracking

### Updated Tables:
- `user_posts` - Added `images` column (TEXT[])
- `profiles` - Added `push_token` column for notifications

## Mobile App Configuration

The app is configured as a Capacitor app with:
- App ID: `com.junubhockup.app`
- App Name: `Junub-hockup`
- Push notifications enabled
- Local notifications enabled
- Splash screen configured

## Deployment

### Web Deployment
```bash
npm run build
# Deploy the `dist` folder to your hosting platform
```

### Mobile App Deployment
1. Build the web app: `npm run build`
2. Sync with Capacitor: `npx cap sync`
3. Open in native IDE: `npx cap open android` or `npx cap open ios`
4. Build and deploy through the respective app stores

## Troubleshooting

### Common Issues:

1. **404 on page refresh**: Make sure the `_redirects` file is deployed with your app
2. **Image upload fails**: Check Supabase storage bucket permissions
3. **Push notifications not working**: Ensure proper mobile build and permissions
4. **TypeScript errors**: Run migrations to update database schema

### Database Migration Order:
1. Run existing migrations first
2. Apply `20250822211940_add_post_images.sql`
3. Apply `20250822212426_add_notifications.sql`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
