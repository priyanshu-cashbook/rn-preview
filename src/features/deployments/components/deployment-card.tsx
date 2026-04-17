import { Pressable, StyleSheet, Text, View } from "react-native";

import type { DeploymentDescriptor } from "@/features/deployments/model/types";
import { StatusPill } from "@/features/deployments/components/status-pill";

interface DeploymentCardProps {
  deployment: DeploymentDescriptor;
  isActive: boolean;
  isSwitching: boolean;
  onPress: () => void;
}

export function DeploymentCard({
  deployment,
  isActive,
  isSwitching,
  onPress,
}: DeploymentCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: deployment.theme.surface,
          borderColor: isActive ? deployment.theme.accent : deployment.theme.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <StatusPill
            label={deployment.flavor}
            tone={deployment.theme.accent}
            background={deployment.theme.accentSoft}
          />
          <Text style={[styles.name, { color: deployment.theme.text }]}>
            {deployment.displayName}
          </Text>
          <Text style={[styles.meta, { color: deployment.theme.mutedText }]}>
            Branch `{deployment.branchName}` {"->"} {deployment.deploymentName}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={isActive || isSwitching}
          onPress={onPress}
          style={[
            styles.button,
            {
              backgroundColor: isActive
                ? deployment.theme.accentSoft
                : deployment.theme.accent,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonLabel,
              { color: isActive ? deployment.theme.accent : "#FFFFFF" },
            ]}
          >
            {isActive ? "Active" : isSwitching ? "Switching..." : "Switch"}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.description, { color: deployment.theme.text }]}>
        {deployment.description}
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: deployment.theme.mutedText }]}>
          Key: {deployment.deploymentKey}
        </Text>
        {deployment.packageLabel ? (
          <Text style={[styles.footerText, { color: deployment.theme.mutedText }]}>
            Release: {deployment.packageLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  button: {
    minWidth: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
