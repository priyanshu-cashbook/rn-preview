import {
  fallbackDeploymentId,
  isPlaceholderDeploymentKey,
} from "@/features/deployments/data/deployment-presets";
import { resolveActiveDeployment } from "@/features/deployments/model/mappers";
import type { DeploymentDescriptor } from "@/features/deployments/model/types";
import {
  canUseNativeRevopush,
  readRunningDeploymentMetadata,
  syncDeploymentKey,
} from "@/services/revopush/runtime";
import { useDeploymentStore } from "@/store/use-deployment-store";

export const hydrateRunningDeployment = async (
  deployments: DeploymentDescriptor[]
) => {
  const metadata = await readRunningDeploymentMetadata();
  const fallbackState = useDeploymentStore.getState();
  const activeDeployment = resolveActiveDeployment(
    metadata?.deploymentKey ?? fallbackState.currentDeploymentKey,
    deployments
  );

  useDeploymentStore.setState({
    deployments,
    activeDeploymentId: activeDeployment?.id ?? fallbackDeploymentId,
    currentDeploymentKey:
      metadata?.deploymentKey ?? activeDeployment?.deploymentKey ?? null,
    currentLabel: metadata?.label ?? activeDeployment?.packageLabel ?? null,
    currentDescription:
      metadata?.description ?? activeDeployment?.packageDescription ?? null,
    status: "ready",
    error: null,
  });
};

export const switchDeployment = async (deployment: DeploymentDescriptor) => {
  useDeploymentStore.setState({
    pendingDeploymentId: deployment.id,
    status: "switching",
    progress: 0,
    error: null,
  });

  if (
    !canUseNativeRevopush() ||
    isPlaceholderDeploymentKey(deployment.deploymentKey)
  ) {
    useDeploymentStore.setState({
      activeDeploymentId: deployment.id,
      currentDeploymentKey: deployment.deploymentKey,
      currentLabel: "mock-preview",
      currentDescription:
        "Mock deployment switch applied. Add real Revopush keys in a dev build to test OTA updates.",
      pendingDeploymentId: null,
      progress: 100,
      status: "ready",
    });

    return {
      mode: "simulated" as const,
      status: "MOCK_SUCCESS",
    };
  }

  const result = await syncDeploymentKey(deployment.deploymentKey, (progress) => {
    const value =
      progress.totalBytes > 0
        ? Math.round((progress.receivedBytes / progress.totalBytes) * 100)
        : 0;

    useDeploymentStore.setState({
      progress: value,
    });
  });

  useDeploymentStore.setState({
    activeDeploymentId: deployment.id,
    currentDeploymentKey: deployment.deploymentKey,
    pendingDeploymentId: null,
    progress: 100,
    status: "ready",
    currentDescription:
      result.status === "UP_TO_DATE"
        ? "This deployment is already active on the device."
        : "Revopush applied the selected deployment. The app may restart immediately.",
  });

  return {
    mode: "native" as const,
    status: result.status,
  };
};
