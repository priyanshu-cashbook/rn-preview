import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import type { DeploymentDescriptor } from "@/features/deployments/model/types";

interface HeroCardProps {
  deployment: DeploymentDescriptor;
  currentLabel: string | null;
  currentDescription: string | null;
}

export function HeroCard({
  deployment,
  currentLabel,
  currentDescription,
}: HeroCardProps) {
  return (
    <LinearGradient
      colors={[deployment.theme.accent, deployment.theme.text]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.eyebrow}>Current deployment</Text>
      <Text style={styles.title}>{deployment.displayName}</Text>
      <Text style={styles.body}>
        Branch `{deployment.branchName}` is mapped to `{deployment.deploymentName}`.
      </Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Deployment key</Text>
          <Text style={styles.statValue}>{deployment.deploymentKey}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Revopush label</Text>
          <Text style={styles.statValue}>{currentLabel ?? "Not installed yet"}</Text>
        </View>
      </View>
      <Text style={styles.helper}>
        {currentDescription ??
          "Switch deployments from the Preview screen to simulate production, staging, and branch previews."}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 22,
    gap: 14,
  },
  eyebrow: {
    color: "#E9F2FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
  },
  body: {
    color: "#F8FAFC",
    fontSize: 16,
    lineHeight: 22,
  },
  stats: {
    gap: 10,
  },
  stat: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  statLabel: {
    color: "#D9E7F5",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  helper: {
    color: "#E0ECFF",
    fontSize: 13,
    lineHeight: 20,
  },
});
