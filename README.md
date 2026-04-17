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

Copy `.env.example` to `.env` and fill in the appropriate values:

```bash
cp .env.example .env
```

`.env.example` is split into three sections:

- **Client-public (`EXPO_PUBLIC_*`)** — inlined into the mobile JS bundle. Safe for deployment keys, app names, and the preview API URL. Never put the Revopush admin access key here.
- **Server-only** — consumed by the Expo Router API routes (`src/app/deployments/list+api.ts`). Configure these on your server host (EAS Hosting, Vercel, etc.), not on developer machines unless you run the server locally.
- **GitHub Action** — secret + variables configured in the GitHub repo, not in `.env`.

## Co-located preview API

The app fetches its deployment catalog from `POST /deployments/list`. That endpoint is served by an Expo Router API route at [src/app/deployments/list+api.ts](src/app/deployments/list+api.ts). Because `web.output` is set to `"server"` in [app.config.ts](app.config.ts), `expo export` produces a Node server bundle that serves both the web app and the API routes.

Deploy options:

- **EAS Hosting** (recommended): `npx eas deploy` after `eas init`.
- **Vercel**: `vercel deploy` with the framework preset `Expo`.
- **Self-hosted Node**: `npx expo export --platform web` then run the generated server entry.

Set `EXPO_PUBLIC_PREVIEW_API_URL` to the deployed origin (no trailing slash). If left blank, the app falls back to the seeded in-bundle catalog for mock mode.

## GitHub Action: per-branch preview deployments

[.github/workflows/release-preview.yml](.github/workflows/release-preview.yml) runs on every push. The release target is derived from the branch:

| Branch | Revopush deployment |
| --- | --- |
| `main` | `Production` |
| `staging` | `Staging` |
| anything else | the branch name, sanitized to `[A-Za-z0-9_-]` (e.g. `feat/payments-redesign` → `feat-payments-redesign`) |

Jobs:

- `get_version` — reads `versionName` from [android/app/build.gradle](android/app/build.gradle), derives a major-version semver range `>=N.0.0 <N.1000.0`, and resolves the deployment name.
- `android_preview_deployment` — bundles with `npx expo export:embed --platform android --bytecode`, releases to Revopush. Skipped when `vars.REVOPUSH_APP_NAME_ANDROID` is unset.
- `ios_preview_deployment` — mirror job for iOS. Skipped when `vars.REVOPUSH_APP_NAME_IOS` is unset, so you can enable iOS later by just setting that variable.
- `cleanup_deployment` — on branch delete, removes the matching deployment from both Android and iOS apps. Never runs for `main` or `staging`.

The target binary version passed to `revopush release` is a **major-version range**, so a single preview release is valid across all installed binaries on that major line — minor `versionName` bumps on the native side do not invalidate preview bundles.

If the pushed branch has an open PR, the workflow posts/updates a PR comment with the deployment name, version range, commit, and (best-effort) the deployment key.

### Why `expo export:embed --bytecode` instead of `react-native bundle` + manual Hermes

Reference workflows you'll find in bare RN projects do a two-step `react-native bundle` then `hermesc -emit-binary`. That bypasses Expo's asset resolver and config-plugin modifiers, which can cause silent asset mismatches in an Expo app. `expo export:embed --bytecode` wraps the same Metro + Hermes steps with the Expo toolchain, which is what the Revopush Expo docs prescribe.

### Required repo configuration

| Kind | Name | Scope | Purpose |
| --- | --- | --- | --- |
| Secret | `REVOPUSH_ACCESS_KEY` | Environment `rn-preview` | Admin key from Revopush UI → Settings → Add key |
| Variable | `REVOPUSH_APP_NAME_ANDROID` | Environment `rn-preview` | Android app name registered in Revopush (e.g. `SelfPreviewAndroid`) |
| Variable | `REVOPUSH_APP_NAME_IOS` | **Repo-level** (top-level Variables tab) | iOS app name. Gates the iOS job at `if:` evaluation time; GitHub does not expose environment-scoped vars there, so this one must live at the repo level or the iOS job silently skips. |
| Variable | `EXPO_PUBLIC_PREVIEW_API_URL` | Environment `rn-preview` | Deployed preview API origin (no trailing slash) |

Set environment-scoped entries under **Settings → Environments → `rn-preview`**, and repo-level entries under **Settings → Secrets and variables → Actions → Variables**.

### Exposing preview branches to the app

The mobile app reads its catalog from the server. To make a new preview selectable in the UI without a rebuild, add it to the server-only env var `REVOPUSH_DYNAMIC_DEPLOYMENTS`:

```jsonc
// Value for REVOPUSH_DYNAMIC_DEPLOYMENTS
[
  { "id": "preview-feat-payments-redesign", "name": "preview-feat-payments-redesign", "key": "<deployment-key>" }
]
```

Then redeploy the API (EAS Hosting and Vercel both redeploy on env-var change). Alternatively extend [src/app/deployments/list+api.ts](src/app/deployments/list+api.ts) to shell out to `revopush deployment ls -k` at request time — noted but out of scope for v1.

### Enabling iOS

The workflow ships with Android only because no iOS binary exists yet. When you have an iOS dev build and an iOS app in Revopush:

1. Add the `REVOPUSH_APP_NAME_IOS` repo variable.
2. Duplicate the `release-android` job as `release-ios` and replace the bundle command with:

   ```bash
   npx expo export:embed \
     --platform ios \
     --dev false \
     --reset-cache \
     --bundle-output ./build-ios/main.jsbundle \
     --assets-dest ./build-ios \
     --bytecode
   ```

3. Use `./build-ios` and `$APP_NAME_IOS` in the `revopush release` call.

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
