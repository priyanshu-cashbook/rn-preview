import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/screen";
import { HeroCard } from "@/features/deployments/components/hero-card";
import { StatusPill } from "@/features/deployments/components/status-pill";
import {
  selectActiveDeployment,
  useDeploymentStore,
} from "@/store/use-deployment-store";

const BRANCH_NAME = "dev";
const BRANCH_LABEL = "Staging preview";
const BRANCH_BG = "#FEF3C7";
const BRANCH_BANNER_BG = "#92400E";

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
  branchBanner: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 4,
  },
  branchBannerLabel: {
    color: "#FDE68A",
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
    color: "#FCD34D",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#102A43",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
  },
  copy: {
    color: "#486581",
    fontSize: 15,
    lineHeight: 22,
  },
  stagingSection: {
    backgroundColor: "#FFFFFF",
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
