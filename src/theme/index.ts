import type { DeploymentTheme } from "@/features/deployments/model/types";

export const baseTheme = {
  shell: "#102A43",
  shellSoft: "#1F4A6B",
  ink: "#F8FAFC",
  cardShadow: "rgba(15, 23, 42, 0.12)",
  divider: "#D6E3F0",
};

export const getShellGradient = (deploymentTheme: DeploymentTheme) => [
  baseTheme.shell,
  deploymentTheme.accent,
];
