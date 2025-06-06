import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.azgaar.fantasymapgenerator',
  appName: 'Fantasy Map Generator',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#5e4fa2",
      showSpinner: true,
      spinnerColor: "#ffffff"
    }
  }
};

export default config;
