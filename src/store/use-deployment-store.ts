import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  deploymentSeeds,
  fallbackDeploymentId,
} from "@/features/deployments/data/deployment-presets";
import type {
  DeploymentDescriptor,
  DeploymentStatus,
} from "@/features/deployments/model/types";

interface DeploymentStoreState {
  deployments: DeploymentDescriptor[];
  activeDeploymentId: string;
  currentDeploymentKey: string | null;
  currentLabel: string | null;
  currentDescription: string | null;
  pendingDeploymentId: string | null;
  progress: number;
  status: DeploymentStatus;
  error: string | null;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  setDeployments: (deployments: DeploymentDescriptor[]) => void;
  setError: (error: string | null) => void;
}

export const useDeploymentStore = create<DeploymentStoreState>()(
  persist(
    (set) => ({
      deployments: deploymentSeeds,
      activeDeploymentId: fallbackDeploymentId,
      currentDeploymentKey: null,
      currentLabel: null,
      currentDescription: null,
      pendingDeploymentId: null,
      progress: 0,
      status: "idle",
      error: null,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      setDeployments: (deployments) => set({ deployments }),
      setError: (error) => set({ error, status: error ? "error" : "ready" }),
    }),
    {
      name: "deployment-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeDeploymentId: state.activeDeploymentId,
        currentDeploymentKey: state.currentDeploymentKey,
        currentLabel: state.currentLabel,
        currentDescription: state.currentDescription,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const selectActiveDeployment = (state: DeploymentStoreState) =>
  state.deployments.find((deployment) => deployment.id === state.activeDeploymentId) ??
  state.deployments[0] ??
  deploymentSeeds[0];
