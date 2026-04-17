import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/screen";
import { HeroCard } from "@/features/deployments/components/hero-card";
import {
  selectActiveDeployment,
  useDeploymentStore,
} from "@/store/use-deployment-store";

const BRANCH_NAME = "feat/payments-redesign";
const BRANCH_LABEL = "Payments redesign";
const BRANCH_BG = "#FCE7F3";
const BRANCH_BANNER_BG = "#9D174D";

export default function HomeScreen() {
  const deployment = useDeploymentStore(selectActiveDeployment);
  const currentLabel = useDeploymentStore((state) => state.currentLabel);
  const currentDescription = useDeploymentStore((state) => state.currentDescription);

  return (
    <Screen
      title="RN Preview Switcher"
      subtitle="A clean Expo SDK 55 demo showing how branch-based mobile previews can feel as fast as web preview deployments."
      background={BRANCH_BG}
    >
      <View style={[styles.branchBanner, { backgroundColor: BRANCH_BANNER_BG }]}>
        <Text style={styles.branchBannerLabel}>BRANCH</Text>
        <Text style={styles.branchBannerName}>{BRANCH_NAME}</Text>
        <Text style={styles.branchBannerTag}>{BRANCH_LABEL}</Text>
      </View>

      <HeroCard
        deployment={deployment}
        currentLabel={currentLabel}
        currentDescription={currentDescription}
      />

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
  branchBanner: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 4,
  },
  branchBannerLabel: {
    color: "#FBCFE8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  branchBannerName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    fontFamily: "Courier",
  },
  branchBannerTag: {
    color: "#F9A8D4",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#831843",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
  },
  copy: {
    color: "#9D174D",
    fontSize: 15,
    lineHeight: 22,
  },
  paymentsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FBCFE8",
    gap: 14,
  },
  paymentsEyebrow: {
    color: "#BE185D",
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
    backgroundColor: "#FDF2F8",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FBCFE8",
    gap: 6,
  },
  metricValue: {
    color: "#831843",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
  },
  metricLabel: {
    color: "#9D174D",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
