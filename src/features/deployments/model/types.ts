export type DeploymentFlavor = "production" | "staging" | "preview";

export type DeploymentStatus =
  | "idle"
  | "loading"
  | "ready"
  | "switching"
  | "error";

export interface DeploymentTheme {
  accent: string;
  accentSoft: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  mutedText: string;
}

export interface DeploymentDescriptor {
  id: string;
  deploymentName: string;
  deploymentKey: string;
  branchName: string;
  displayName: string;
  flavor: DeploymentFlavor;
  description: string;
  source: "seed" | "remote";
  isDefault?: boolean;
  packageLabel?: string;
  packageDescription?: string;
  packageAppVersion?: string;
  createdTime?: string;
  theme: DeploymentTheme;
}

export interface RemoteDeploymentPackage {
  description?: string;
  appVersion?: string;
  label?: string;
}

export interface RemoteDeployment {
  id: string;
  key: string;
  name: string;
  createdTime?: string;
  package?: RemoteDeploymentPackage;
}

export interface BranchPreviewMapping {
  branchName: string;
  deploymentName: string;
  deploymentKey: string;
}
