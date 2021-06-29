import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xrengine.social',
  appName: 'com.xrengine.social',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
  server: {
    hostname: "dev.arcmedia.us",
    androidScheme: "https",
    iosScheme: "https"
  }
};

export default config;