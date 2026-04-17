# RN Preview Switcher

An Expo SDK 55 + Expo Router demo that shows how branch-based React Native preview deployments can work with Revopush.

## What this project demonstrates

- Branch-based preview deployments similar to Vercel previews, but for a React Native app.
- Runtime switching between `production`, `staging`, and preview branch deployments.
- Different visual treatment per deployment so switching is easy to verify.
- A thin architecture inspired by the reference repos, without rebuilding their backend wholesale.

## Reference architecture distilled

### Frontend reference repo

From `badho-open/rn-self-serve-preview`, the important reusable idea is:

- The app fetches deployments from a lightweight server.
- The active deployment is determined from Revopush metadata.
- Switching happens by calling Revopush `sync` with an overridden `deploymentKey`.

### Server reference repo

From `badho-open/rn-self-serve-preview-server`, the important reusable idea is:

- The server is intentionally small.
- It logs into Revopush CLI with an access key.
- It lists deployments for the platform-specific app.
- It can create a new deployment on demand.

That means the app does not need a complicated backend. It only needs a deployment catalog endpoint and a branch-to-deployment naming convention.

## Project structure

```text
.
├── app.config.ts
├── .env.example
├── src
│   ├── app
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── preview.tsx
│   ├── components
│   │   └── screen.tsx
│   ├── features
│   │   └── deployments
│   │       ├── components
│   │       │   ├── deployment-card.tsx
│   │       │   ├── hero-card.tsx
│   │       │   └── status-pill.tsx
│   │       ├── data
│   │       │   └── deployment-presets.ts
│   │       ├── hooks
│   │       │   └── use-deployment-bootstrap.ts
│   │       └── model
│   │           ├── mappers.ts
│   │           └── types.ts
│   ├── services
│   │   ├── api
│   │   │   └── deployments-api.ts
│   │   └── revopush
│   │       ├── client.native.ts
│   │       ├── client.ts
│   │       ├── deployment-manager.ts
│   │       └── runtime.ts
│   ├── store
│   │   └── use-deployment-store.ts
│   └── theme
│       └── index.ts
└── assets
```

## How deployment switching works

1. `app.config.ts` configures the Revopush Expo plugin with a base native deployment key.
2. `src/services/api/deployments-api.ts` loads the available deployments.
3. `src/services/revopush/deployment-manager.ts` reads the currently running deployment metadata from Revopush.
4. When the user taps **Switch**, the app calls Revopush `sync` with the selected deployment's `deploymentKey`.
5. With real keys in a dev build, Revopush downloads and installs the matching OTA bundle.
6. Without real keys, the app falls back to a local simulation so the navigation and architecture remain testable.

## How branch preview simulation works

The demo seeds a few branch mappings:

- `main` -> `Production`
- `dev` -> `Staging`
- `feature-x` -> `preview-feature-x`
- `feat/payments-redesign` -> `preview-payments-redesign`

Each deployment has its own color language:

- Production uses green
- Staging uses amber
- Preview branches use purple

If you point `EXPO_PUBLIC_PREVIEW_API_URL` at a real server, remote deployments are merged into the seeded catalog. Unknown remote deployment names are treated as preview channels.

## Revopush integration

This project uses:

- `@revopush/react-native-code-push`
- `@revopush/expo-code-push-plugin`
- a local Expo config plugin at `plugins/with-revopush-sdk55.js`

Important notes from the docs:

- Revopush does not work in Expo Go.
- You need a native build or development build.
- If you change plugin configuration, run `expo prebuild --clean` again.
- If you ever hit the known bundle-name issue mentioned in the Revopush docs, remove `expo-updates` and prebuild again.

### Why there is a local compatibility plugin

During implementation, `@revopush/expo-code-push-plugin@1.0.1` failed on Expo SDK 55 Android prebuild because it expects an older `MainApplication.kt` shape.

The local plugin keeps the same configuration intent, but patches the current Expo SDK 55 host correctly by:

- writing deployment keys to native config
- wiring `codepush.gradle`
- initializing CodePush before the Expo React host is created
- passing `CodePush.getJSBundleFile()` into `ExpoReactHostFactory`

## Environment variables

Copy `.env.example` to `.env` and replace the placeholder keys:

```bash
cp .env.example .env
```

## Commands

```bash
npm install
npm run prebuild
npm run android
# or
npm run ios
```

During UI-only exploration you can still run:

```bash
npm run web
```

## Testing deployment switching

### Mock mode

1. Leave the placeholder deployment keys in place.
2. Start the app on web or Expo Go.
3. Open the drawer and go to **Preview Switcher**.
4. Switch between Production, Staging, and Preview deployments.
5. Verify the Home screen changes its messaging and deployment theme.

### Real Revopush mode

1. Create the iOS and Android apps in Revopush.
2. Copy the real deployment keys into `.env`.
3. Run `npm run prebuild`.
4. Build and launch a dev build with `npm run android` or `npm run ios`.
5. Release bundles into the matching Revopush deployments.
6. Open **Preview Switcher** and switch between deployments.

## Example release flow

After you have your binary built, use the release flow from the Revopush Expo docs:

```bash
npx expo export:embed --platform android --dev false --reset-cache --bundle-output ./build-android/index.android.bundle --assets-dest ./build-android --bytecode
revopush release <APP_NAME> ./build-android <TARGET_VERSION> -d <DEPLOYMENT_NAME> --mandatory
```

```bash
npx expo export:embed --platform ios --dev false --reset-cache --bundle-output ./build-ios/main.jsbundle --assets-dest ./build-ios --bytecode
revopush release <APP_NAME> ./build-ios <TARGET_VERSION> -d <DEPLOYMENT_NAME> --mandatory
```

## Minimal preview server contract

If you want to plug in the server reference repo, the app expects:

- `POST /deployments/list`
- JSON body: `{ "platform": "ios" | "android" }`
- JSON response with deployment `id`, `key`, `name`, and optional package metadata

That matches the pattern used in the reference server repo.
