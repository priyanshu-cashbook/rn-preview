import Constants from "expo-constants";

import {
  getUpdateMetadata,
  isCodePushRuntimeAvailable,
  syncToDeployment,
} from "@/services/revopush/client";

export const isExpoGo = Constants.executionEnvironment === "storeClient";

export const canUseNativeRevopush = () =>
  !isExpoGo && isCodePushRuntimeAvailable();

export const readRunningDeploymentMetadata = () => getUpdateMetadata();

export const syncDeploymentKey = syncToDeployment;
