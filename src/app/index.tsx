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

      <View style={styles.stagingSection}>
        <Text style={styles.stagingEyebrow}>Dev branch only</Text>
        <Text style={styles.sectionTitle}>Staging validation checklist</Text>
        <Text style={styles.copy}>
          This card only exists on the `dev` branch and gives QA a fast way to
          confirm that a staging deployment was actually loaded on-device.
        </Text>
        <View style={styles.checklistRow}>
          <StatusPill label="QA Ready" tone="#8A6412" background="#FFF4D6" />
          <StatusPill label="Branch: dev" tone="#8A6412" background="#FFF4D6" />
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
  stagingSection: {
    backgroundColor: "#FFF7E0",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F2D18A",
    gap: 14,
  },
  stagingEyebrow: {
    color: "#B7791F",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  checklistRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
