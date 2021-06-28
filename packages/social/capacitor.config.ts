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
    "url": "https://dev.arcmedia.us",
		"androidScheme": "https",
		"iosScheme": "https",
        "allowNavigation": ["*.arcmedia.us"]
  }
};

export default config;