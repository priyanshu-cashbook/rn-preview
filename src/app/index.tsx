import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/screen";
import { HeroCard } from "@/features/deployments/components/hero-card";
import {
  selectActiveDeployment,
  useDeploymentStore,
} from "@/store/use-deployment-store";

const BRANCH_NAME = "feature-x";
const BRANCH_LABEL = "Feature X preview";
const BRANCH_BG = "#EDE9FE";
const BRANCH_BANNER_BG = "#5B21B6";

export default function HomeScreen() {
  const deployment = useDeploymentStore(selectActiveDeployment);
  const currentLabel = useDeploymentStore((state) => state.currentLabel);
  const currentDescription = useDeploymentStore(
    (state) => state.currentDescription,
  );

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

      <View style={styles.featureSection}>
        <Text style={styles.featureEyebrow}>Feature X preview</Text>
        <Text style={styles.featureTitle}>Guided rollout lane</Text>
        <Text style={styles.featureCopy}>
          The `feature-x` branch adds a more product-facing module so stakeholders can
          instantly tell they are no longer looking at staging or production.
        </Text>
        <View style={styles.featureRail}>
          <View style={styles.featureStep}>
            <Text style={styles.featureStepTitle}>01</Text>
            <Text style={styles.featureStepBody}>Activate the branch deployment</Text>
          </View>
          <View style={styles.featureStep}>
            <Text style={styles.featureStepTitle}>02</Text>
            <Text style={styles.featureStepBody}>Verify the new preview lane appears</Text>
          </View>
          <View style={styles.featureStep}>
            <Text style={styles.featureStepTitle}>03</Text>
            <Text style={styles.featureStepBody}>Collect stakeholder feedback instantly</Text>
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
    color: "#DDD6FE",
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
    color: "#C4B5FD",
    fontSize: 13,
    fontWeight: "700",
  },
  featureSection: {
    backgroundColor: "#2D1457",
    borderRadius: 28,
    padding: 20,
    gap: 14,
  },
  featureEyebrow: {
    color: "#D8B4FE",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
  },
  featureCopy: {
    color: "#E9D8FD",
    fontSize: 15,
    lineHeight: 22,
  },
  featureRail: {
    gap: 10,
  },
  featureStep: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  featureStepTitle: {
    color: "#D8B4FE",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  featureStepBody: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
});
