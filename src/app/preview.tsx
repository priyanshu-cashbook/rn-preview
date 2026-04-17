import { useDeferredValue, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/screen";
import { DeploymentCard } from "@/features/deployments/components/deployment-card";
import { StatusPill } from "@/features/deployments/components/status-pill";
import type { DeploymentDescriptor } from "@/features/deployments/model/types";
import { switchDeployment } from "@/services/revopush/deployment-manager";
import {
  selectActiveDeployment,
  useDeploymentStore,
} from "@/store/use-deployment-store";

export default function PreviewScreen() {
  const deployments = useDeploymentStore((state) => state.deployments);
  const activeDeployment = useDeploymentStore(selectActiveDeployment);
  const pendingDeploymentId = useDeploymentStore((state) => state.pendingDeploymentId);
  const progress = useDeploymentStore((state) => state.progress);
  const error = useDeploymentStore((state) => state.error);
  const currentKey = useDeploymentStore((state) => state.currentDeploymentKey);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredDeployments = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    if (!normalized) {
      return deployments;
    }

    return deployments.filter((deployment) =>
      [
        deployment.displayName,
        deployment.branchName,
        deployment.deploymentName,
        deployment.deploymentKey,
        deployment.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [deferredQuery, deployments]);

  const handleSwitch = async (deployment: DeploymentDescriptor) => {
    try {
      const result = await switchDeployment(deployment);

      Alert.alert(
        "Deployment switch complete",
        result.mode === "native"
          ? result.status === "UPDATE_INSTALLED"
            ? "Revopush downloaded the new bundle. The app will restart now."
            : `Revopush sync finished with status ${result.status}.`
          : "Mock switch complete. Add real deployment keys and run a dev build to verify OTA updates."
      );
    } catch (switchError) {
      Alert.alert(
        "Switch failed",
        switchError instanceof Error
          ? switchError.message
          : "Unexpected error while switching deployments."
      );
    }
  };

  return (
    <Screen
      title="Preview Switcher"
      subtitle="Choose the target deployment just like a stakeholder picking a preview URL, except this one swaps the JS bundle inside the native app."
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Current target</Text>
        <Text style={styles.summaryName}>{activeDeployment.displayName}</Text>
        <Text style={styles.summaryMeta}>
          Active key: {currentKey ?? activeDeployment.deploymentKey}
        </Text>
        <View style={styles.summaryRow}>
          <StatusPill
            label={`${progress}%`}
            tone="#0F172A"
            background="#E2E8F0"
          />
          <StatusPill
            label={activeDeployment.flavor}
            tone={activeDeployment.theme.accent}
            background={activeDeployment.theme.accentSoft}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>Search deployments</Text>
        <TextInput
          placeholder="main, dev, feature-x, preview..."
          placeholderTextColor="#829AB1"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.list}>
        {filteredDeployments.map((deployment) => (
          <DeploymentCard
            key={deployment.id}
            deployment={deployment}
            isActive={deployment.id === activeDeployment.id}
            isSwitching={pendingDeploymentId === deployment.id}
            onPress={() => handleSwitch(deployment)}
          />
        ))}
      </View>

      <Pressable
        onPress={() => setQuery("")}
        style={styles.clearButton}
        accessibilityRole="button"
      >
        <Text style={styles.clearButtonLabel}>Clear search</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D6E3F0",
    gap: 10,
  },
  summaryTitle: {
    color: "#486581",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  summaryName: {
    color: "#102A43",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
  },
  summaryMeta: {
    color: "#486581",
    fontSize: 14,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  error: {
    color: "#B42318",
    fontSize: 14,
    lineHeight: 20,
  },
  searchCard: {
    gap: 8,
  },
  searchLabel: {
    color: "#243B53",
    fontSize: 14,
    fontWeight: "700",
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6E3F0",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#102A43",
  },
  list: {
    gap: 14,
  },
  clearButton: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#E7EEF5",
  },
  clearButtonLabel: {
    color: "#243B53",
    fontSize: 13,
    fontWeight: "800",
  },
});
