import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/screen";
import { HeroCard } from "@/features/deployments/components/hero-card";
import { StatusPill } from "@/features/deployments/components/status-pill";
import { toBranchPreviewMapping } from "@/features/deployments/model/mappers";
import { canUseNativeRevopush, isExpoGo } from "@/services/revopush/runtime";
import {
  selectActiveDeployment,
  useDeploymentStore,
} from "@/store/use-deployment-store";

export default function HomeScreen() {
  const deployment = useDeploymentStore(selectActiveDeployment);
  const deployments = useDeploymentStore((state) => state.deployments);
  const currentLabel = useDeploymentStore((state) => state.currentLabel);
  const currentDescription = useDeploymentStore((state) => state.currentDescription);
  const status = useDeploymentStore((state) => state.status);

  const mappings = toBranchPreviewMapping(deployments);

  return (
    <Screen
      title="RN Preview Switcher"
      subtitle="A clean Expo SDK 55 demo showing how branch-based mobile previews can feel as fast as web preview deployments."
    >
      <HeroCard
        deployment={deployment}
        currentLabel={currentLabel}
        currentDescription={currentDescription}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environment health</Text>
        <View style={styles.pillRow}>
          <StatusPill
            label={status}
            tone="#0F172A"
            background="#DBEAFE"
          />
          <StatusPill
            label={canUseNativeRevopush() ? "Dev Build" : isExpoGo ? "Expo Go" : "Web"}
            tone={canUseNativeRevopush() ? "#1F9D55" : "#8A6412"}
            background={canUseNativeRevopush() ? "#D9F8E7" : "#FFF4D6"}
          />
        </View>
        <Text style={styles.copy}>
          Revopush needs a native build. This project still renders in Expo Go or web,
          but deployment switching becomes a local simulation until you run a dev build.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Branch mapping</Text>
        {mappings.map((mapping) => (
          <View key={mapping.branchName} style={styles.mappingRow}>
            <Text style={styles.mappingBranch}>{mapping.branchName}</Text>
            <Text style={styles.mappingArrow}>{"->"}</Text>
            <View style={styles.mappingCopy}>
              <Text style={styles.mappingName}>{mapping.deploymentName}</Text>
              <Text style={styles.mappingKey}>{mapping.deploymentKey}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How this demo works</Text>
        <Text style={styles.copy}>
          The binary ships with a base deployment key from `app.config.ts`. At runtime,
          the Preview screen overrides that target by calling Revopush `sync` with a
          different deployment key, which is the same core idea used in the reference repos.
        </Text>
      </View>

      <View style={styles.paymentsSection}>
        <Text style={styles.paymentsEyebrow}>Payments redesign preview</Text>
        <Text style={styles.sectionTitle}>Checkout confidence snapshot</Text>
        <Text style={styles.copy}>
          This branch adds a commerce-style summary block to make the
          `feat/payments-redesign` deployment unmistakable after OTA release.
        </Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>New payment options</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>1.2s</Text>
            <Text style={styles.metricLabel}>Faster checkout goal</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>98%</Text>
            <Text style={styles.metricLabel}>Expected success rate</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D6E3F0",
    gap: 14,
  },
  sectionTitle: {
    color: "#102A43",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  copy: {
    color: "#486581",
    fontSize: 15,
    lineHeight: 22,
  },
  mappingRow: {
    borderRadius: 18,
    backgroundColor: "#F4F8FB",
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  mappingBranch: {
    width: 92,
    color: "#102A43",
    fontSize: 14,
    fontWeight: "800",
  },
  mappingArrow: {
    color: "#829AB1",
    fontSize: 16,
    fontWeight: "800",
  },
  mappingCopy: {
    flex: 1,
    gap: 2,
  },
  mappingName: {
    color: "#243B53",
    fontSize: 14,
    fontWeight: "700",
  },
  mappingKey: {
    color: "#486581",
    fontSize: 12,
  },
  paymentsSection: {
    backgroundColor: "#ECFDF3",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 14,
  },
  paymentsEyebrow: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    minWidth: 98,
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    gap: 6,
  },
  metricValue: {
    color: "#065F46",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
  },
  metricLabel: {
    color: "#047857",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
