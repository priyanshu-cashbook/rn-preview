import Constants from "expo-constants";
import { Platform } from "react-native";

import {
  deploymentSeeds,
  fallbackDeploymentId,
} from "@/features/deployments/data/deployment-presets";
import { mergeRemoteDeployments } from "@/features/deployments/model/mappers";
import type {
  DeploymentDescriptor,
  RemoteDeployment,
} from "@/features/deployments/model/types";

type ExpoExtra = {
  previewApiUrl?: string;
};

type ServerResponse = {
  success: boolean;
  data: RemoteDeployment[];
  error?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const getPreviewApiUrl = () => extra.previewApiUrl?.trim() ?? "";

export const fetchAvailableDeployments = async (): Promise<DeploymentDescriptor[]> => {
  const previewApiUrl = getPreviewApiUrl();

  if (!previewApiUrl) {
    await delay(200);
    return deploymentSeeds;
  }

  const response = await fetch(`${previewApiUrl}/deployments/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: Platform.OS === "ios" ? "ios" : "android",
    }),
  });

  const payload = (await response.json()) as ServerResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Failed to fetch deployments from preview API");
  }

  return mergeRemoteDeployments(payload.data);
};

export const getFallbackDeployment = () =>
  deploymentSeeds.find((deployment) => deployment.id === fallbackDeploymentId) ??
  deploymentSeeds[0];
