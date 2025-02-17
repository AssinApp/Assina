import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const envConfig: ExpoConfig = {
    ...config,
    slug: 'AssinApp',
    name:  'AssinApp',
    owner: "assinapp",
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER,
      buildNumber: '1',
    },
    android: {
      ...config.android,
      package: process.env.EXPO_PUBLIC_IOS_ANDROID_PACKAGE,
      versionCode: 1,
    },
    updates: {
      url: `https://u.expo.dev/${process.env.EXPO_PUBLIC_PROJECT_ID}`,
    },
    runtimeVersion: "1.0.0",
    extra: {
      ...config.extra,
      eas: { projectId: '3dfaff3d-eaae-4c91-b271-4fd266488860'},
      ENV: process.env.EXPO_PUBLIC_ENV,
      API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
  };
  return envConfig;
};
