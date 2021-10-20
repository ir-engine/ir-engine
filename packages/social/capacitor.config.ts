import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xrengine.social',
  appName: 'com.xrengine.social',
  webDir: 'www',
  loggingBehavior: 'none',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
  ios: {
    "limitsNavigationsToAppBoundDomains": true
  },
  server: {
    "url": "https://dev.arcmedia.us",
    "allowNavigation": ["*.arcmedia.us"]
  }
};

export default config;