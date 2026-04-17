const {
  AndroidConfig,
  withAppBuildGradle,
  withAppDelegate,
  withInfoPlist,
  withMainApplication,
  withStringsXml,
} = require("@expo/config-plugins");
const { addImports } = require("@expo/config-plugins/build/android/codeMod");
const { mergeContents } = require("@expo/config-plugins/build/utils/generateCode");

const withIosPlugin = (config, { ios }) => {
  if (!ios) {
    return config;
  }

  config = withInfoPlist(config, (mod) => {
    mod.modResults.CodePushDeploymentKey = ios.CodePushDeploymentKey;

    if (ios.CodePushServerUrl) {
      mod.modResults.CodePushServerURL = ios.CodePushServerUrl;
    }

    return mod;
  });

  config = withAppDelegate(config, (mod) => {
    if (mod.modResults.language !== "swift") {
      throw new Error("with-revopush-sdk55 only supports Swift AppDelegate files");
    }

    let contents = mod.modResults.contents;

    if (!contents.includes("import CodePush")) {
      contents = mergeContents({
        src: contents,
        comment: "//",
        tag: "revopush-updates-header",
        offset: 1,
        anchor: /import React/,
        newSrc: "import CodePush",
      }).contents;
    }

    contents = contents.replace(
      /return Bundle\.main\.url\(forResource: "main", withExtension: "jsbundle"\)/,
      "return CodePush.bundleURL()"
    );

    mod.modResults.contents = contents;
    return mod;
  });

  return config;
};

const withAndroidPlugin = (config, { android }) => {
  if (!android) {
    return config;
  }

  config = withStringsXml(config, (mod) => {
    AndroidConfig.Strings.setStringItem(
      [
        {
          $: {
            name: "CodePushDeploymentKey",
            translatable: "false",
            moduleConfig: "true",
          },
          _: android.CodePushDeploymentKey,
        },
      ],
      mod.modResults
    );

    if (android.CodePushServerUrl) {
      AndroidConfig.Strings.setStringItem(
        [
          {
            $: {
              name: "CodePushServerUrl",
              translatable: "false",
              moduleConfig: "true",
            },
            _: android.CodePushServerUrl,
          },
        ],
        mod.modResults
      );
    }

    return mod;
  });

  config = withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== "groovy") {
      throw new Error("with-revopush-sdk55 expects android/app/build.gradle in Groovy");
    }

    if (!mod.modResults.contents.includes("@revopush/gradle")) {
      mod.modResults.contents +=
        '\n// @revopush/gradle\napply from: "../../node_modules/@revopush/react-native-code-push/android/codepush.gradle"\n';
    }

    return mod;
  });

  config = withMainApplication(config, (mod) => {
    if (mod.modResults.language !== "kt") {
      throw new Error("with-revopush-sdk55 currently supports Kotlin MainApplication only");
    }

    let contents = mod.modResults.contents;
    contents = addImports(
      contents,
      [
        "android.util.Log",
        "com.microsoft.codepush.react.CodePush",
        "com.microsoft.codepush.react.ReactHostHolder",
      ],
      false
    );

    contents = contents.replace(
      "class MainApplication : Application(), ReactApplication {",
      "class MainApplication : Application(), ReactApplication {"
    );

    if (!contents.includes("jsBundleFilePath = CodePush.getJSBundleFile()")) {
      contents = contents.replace(
        /(\s+PackageList\(this\)\.packages\.apply \{\n[\s\S]*?\n\s+\}\n)(\s+\))/,
        `$1      ,
      jsBundleFilePath = CodePush.getJSBundleFile()
$2`
      );
    }

    if (!contents.includes("CodePush.setReactHost(object : ReactHostHolder")) {
      contents = mergeContents({
        src: contents,
        comment: "//",
        tag: "@revopush/main-application-kt-oncreate-sdk55",
        offset: 1,
        anchor: /super\.onCreate\(\)/,
        newSrc: `try {
      val deploymentKey = getString(R.string.CodePushDeploymentKey)
      CodePush.getInstance(deploymentKey, applicationContext, BuildConfig.DEBUG)
      CodePush.setReactHost(object : ReactHostHolder {
        override fun getReactHost(): ReactHost = reactHost
      })
    } catch (e: Exception) {
      Log.e("CodePush", "Failed to initialize CodePush", e)
    }`,
      }).contents;
    }

    mod.modResults.contents = contents;
    return mod;
  });

  return config;
};

module.exports = function withRevopushSdk55(config, options = {}) {
  config = withAndroidPlugin(config, options);
  return withIosPlugin(config, options);
};
