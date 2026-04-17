import {
  deploymentSeeds,
  getDeploymentByKey,
} from "@/features/deployments/data/deployment-presets";
import type {
  BranchPreviewMapping,
  DeploymentDescriptor,
  RemoteDeployment,
} from "@/features/deployments/model/types";

const inferFlavor = (deploymentName: string) => {
  const normalized = deploymentName.toLowerCase();

  if (normalized.includes("prod")) {
    return "production" as const;
  }

  if (normalized.includes("staging") || normalized.includes("stage")) {
    return "staging" as const;
  }

  return "preview" as const;
};

const inferBranchName = (deploymentName: string) => {
  const normalized = deploymentName.toLowerCase();

  if (normalized === "production") {
    return "main";
  }

  if (normalized === "staging") {
    return "dev";
  }

  return deploymentName;
};

export const mergeRemoteDeployments = (
  remoteDeployments: RemoteDeployment[]
): DeploymentDescriptor[] => {
  const seedByName = new Map(
    deploymentSeeds.map((deployment) => [
      deployment.deploymentName.toLowerCase(),
      deployment,
    ])
  );

  const merged: DeploymentDescriptor[] = remoteDeployments.map((remote) => {
    const preset = seedByName.get(remote.name.toLowerCase());

    if (preset) {
      return {
        ...preset,
        deploymentKey: remote.key,
        packageLabel: remote.package?.label,
        packageDescription: remote.package?.description,
        packageAppVersion: remote.package?.appVersion,
        createdTime: remote.createdTime,
        source: "remote" as const,
      };
    }

    const flavor = inferFlavor(remote.name);
    const seededTheme =
      deploymentSeeds.find((item) => item.flavor === flavor)?.theme ??
      deploymentSeeds[0].theme;

    return {
      id: remote.id,
      deploymentName: remote.name,
      deploymentKey: remote.key,
      branchName: inferBranchName(remote.name),
      displayName: `Preview: ${remote.name}`,
      flavor,
      description:
        remote.package?.description ??
        "Remote deployment discovered from the preview server.",
      source: "remote" as const,
      packageLabel: remote.package?.label,
      packageDescription: remote.package?.description,
      packageAppVersion: remote.package?.appVersion,
      createdTime: remote.createdTime,
      theme: seededTheme,
    };
  });

  const seenNames = new Set(merged.map((item) => item.deploymentName.toLowerCase()));

  for (const seed of deploymentSeeds) {
    if (!seenNames.has(seed.deploymentName.toLowerCase())) {
      merged.push(seed);
    }
  }

  return merged;
};

export const toBranchPreviewMapping = (
  deployments: DeploymentDescriptor[]
): BranchPreviewMapping[] =>
  deployments.map((deployment) => ({
    branchName: deployment.branchName,
    deploymentName: deployment.deploymentName,
    deploymentKey: deployment.deploymentKey,
  }));

export const resolveActiveDeployment = (
  deploymentKey: string | null | undefined,
  deployments: DeploymentDescriptor[]
) =>
  deployments.find((item) => item.deploymentKey === deploymentKey) ??
  getDeploymentByKey(deploymentKey) ??
  deployments.find((item) => item.isDefault) ??
  deployments[0];
