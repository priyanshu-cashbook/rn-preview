import { startTransition, useEffect, useEffectEvent } from "react";

import { hydrateRunningDeployment } from "@/services/revopush/deployment-manager";
import { fetchAvailableDeployments } from "@/services/api/deployments-api";
import { useDeploymentStore } from "@/store/use-deployment-store";

export const useDeploymentBootstrap = () => {
  const setError = useDeploymentStore((state) => state.setError);
  const hydrated = useDeploymentStore((state) => state.hydrated);

  const bootstrap = useEffectEvent(async () => {
    try {
      useDeploymentStore.setState({
        status: "loading",
        error: null,
      });

      const deployments = await fetchAvailableDeployments();

      startTransition(() => {
        useDeploymentStore.setState({
          deployments,
        });
      });

      await hydrateRunningDeployment(deployments);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load deployments");
    }
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void bootstrap();
  }, [bootstrap, hydrated]);
};
