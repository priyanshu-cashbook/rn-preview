import type { ConfigContext, ExpoConfig } from "expo/config";

const placeholder = (value: string | undefined, fallback: string) =>
  value && value.trim().length > 0 ? value : fallback;

export default ({ config }: ConfigContext): ExpoConfig => {
  const productionKey = placeholder(
    process.env.EXPO_PUBLIC_REVOPUSH_PRODUCTION_KEY,
    "REVOPUSH_PRODUCTION_KEY_PLACEHOLDER"
  );
  const stagingKey = placeholder(
    process.env.EXPO_PUBLIC_REVOPUSH_STAGING_KEY,
    "REVOPUSH_STAGING_KEY_PLACEHOLDER"
  );
  const previewFeatureKey = placeholder(
    process.env.EXPO_PUBLIC_REVOPUSH_PREVIEW_FEATURE_X_KEY,
    "REVOPUSH_PREVIEW_FEATURE_X_KEY_PLACEHOLDER"
  );
  const previewPaymentsKey = placeholder(
    process.env.EXPO_PUBLIC_REVOPUSH_PREVIEW_PAYMENTS_KEY,
    "REVOPUSH_PREVIEW_PAYMENTS_KEY_PLACEHOLDER"
  );
  const defaultNativeKey = placeholder(
    process.env.REVOPUSH_DEFAULT_DEPLOYMENT_KEY,
    stagingKey
  );
  const codePushServerUrl = placeholder(
    process.env.REVOPUSH_SERVER_URL,
    "https://api.revopush.org"
  );

  return {
    ...config,
    name: "RN Preview Switcher",
    slug: "rn-preview-switcher",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "rnpreviewswitcher",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/expo.icon",
      bundleIdentifier: "org.example.rnpreviewswitcher",
    },
    android: {
      package: "org.example.rnpreviewswitcher",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#102A43",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 76,
          },
        },
      ],
      [
        "./plugins/with-revopush-sdk55",
        {
          ios: {
            CodePushDeploymentKey: defaultNativeKey,
            CodePushServerUrl: codePushServerUrl,
          },
          android: {
            CodePushDeploymentKey: defaultNativeKey,
            CodePushServerUrl: codePushServerUrl,
          },
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "15.5",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      previewApiUrl: process.env.EXPO_PUBLIC_PREVIEW_API_URL ?? "",
      revopushServerUrl: codePushServerUrl,
      revopushAppNames: {
        ios: process.env.EXPO_PUBLIC_REVOPUSH_APP_NAME_IOS ?? "SelfPreviewIOS",
        android:
          process.env.EXPO_PUBLIC_REVOPUSH_APP_NAME_ANDROID ??
          "SelfPreviewAndroid",
      },
      deployments: {
        productionKey,
        stagingKey,
        previewFeatureKey,
        previewPaymentsKey,
      },
    },
  };
};
