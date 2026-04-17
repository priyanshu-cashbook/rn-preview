import Constants from "expo-constants";

import type {
  DeploymentDescriptor,
  DeploymentFlavor,
  DeploymentTheme,
} from "@/features/deployments/model/types";

const themes: Record<DeploymentFlavor, DeploymentTheme> = {
  production: {
    accent: "#1F9D55",
    accentSoft: "#D9F8E7",
    background: "#F2FBF5",
    surface: "#FFFFFF",
    border: "#B7EACB",
    text: "#123524",
    mutedText: "#35614B",
  },
  staging: {
    accent: "#D69E2E",
    accentSoft: "#FFF4D6",
    background: "#FFFBEF",
    surface: "#FFFFFF",
    border: "#F2D18A",
    text: "#5B3E03",
    mutedText: "#8A6412",
  },
  preview: {
    accent: "#7C3AED",
    accentSoft: "#EFE3FF",
    background: "#FAF5FF",
    surface: "#FFFFFF",
    border: "#D8B4FE",
    text: "#3B145B",
    mutedText: "#6B3FA0",
  },
};

type ExpoExtra = {
  deployments?: {
    productionKey?: string;
    stagingKey?: string;
    previewFeatureKey?: string;
    previewPaymentsKey?: string;
  };
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

export const deploymentSeeds: DeploymentDescriptor[] = [
  {
    id: "production",
    deploymentName: "Production",
    deploymentKey:
      extra.deployments?.productionKey ?? "REVOPUSH_PRODUCTION_KEY_PLACEHOLDER",
    branchName: "main",
    displayName: "Production",
    flavor: "production",
    description: "Stable release channel mapped from the main branch.",
    source: "seed",
    isDefault: false,
    theme: themes.production,
  },
  {
    id: "staging",
    deploymentName: "Staging",
    deploymentKey:
      extra.deployments?.stagingKey ?? "REVOPUSH_STAGING_KEY_PLACEHOLDER",
    branchName: "dev",
    displayName: "Staging",
    flavor: "staging",
    description: "Integration channel for the dev branch and QA validation.",
    source: "seed",
    isDefault: true,
    theme: themes.staging,
  },
  {
    id: "preview-feature-x",
    deploymentName: "preview-feature-x",
    deploymentKey:
      extra.deployments?.previewFeatureKey ??
      "REVOPUSH_PREVIEW_FEATURE_X_KEY_PLACEHOLDER",
    branchName: "feature-x",
    displayName: "Preview: Feature X",
    flavor: "preview",
    description: "A branch preview that lets stakeholders validate feature-x.",
    source: "seed",
    theme: themes.preview,
  },
  {
    id: "preview-payments",
    deploymentName: "preview-payments-redesign",
    deploymentKey:
      extra.deployments?.previewPaymentsKey ??
      "REVOPUSH_PREVIEW_PAYMENTS_KEY_PLACEHOLDER",
    branchName: "feat/payments-redesign",
    displayName: "Preview: Payments Redesign",
    flavor: "preview",
    description: "A second preview branch to show multi-deployment switching.",
    source: "seed",
    theme: themes.preview,
  },
];

export const fallbackDeploymentId =
  deploymentSeeds.find((item) => item.isDefault)?.id ?? deploymentSeeds[0].id;

export const placeholderKeyPattern = /PLACEHOLDER$/;

export const isPlaceholderDeploymentKey = (deploymentKey: string) =>
  placeholderKeyPattern.test(deploymentKey);

export const getDeploymentById = (deploymentId: string) =>
  deploymentSeeds.find((item) => item.id === deploymentId);

export const getDeploymentByKey = (deploymentKey: string | null | undefined) =>
  deploymentSeeds.find((item) => item.deploymentKey === deploymentKey);
