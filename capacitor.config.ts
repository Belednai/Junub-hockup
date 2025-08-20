import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.66db1e01ac0246eeb9fc0256c95deab3',
  appName: 'love-hacks-comic',
  webDir: 'dist',
  server: {
    url: 'https://66db1e01-ac02-46ee-b9fc-0256c95deab3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;