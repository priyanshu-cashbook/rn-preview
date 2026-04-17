import type { ComponentType } from "react";

export interface SyncResult {
  status: string;
}

export interface UpdateMetadata {
  deploymentKey?: string;
  label?: string;
  description?: string;
}

export interface SyncProgress {
  receivedBytes: number;
  totalBytes: number;
}

export const withCodePush = <TProps,>(
  component: ComponentType<TProps>
): ComponentType<TProps> => component;

export const isCodePushRuntimeAvailable = () => false;

export const getUpdateMetadata = async (): Promise<UpdateMetadata | null> => null;

export const syncToDeployment = async (
  _deploymentKey: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> => {
  onProgress?.({
    receivedBytes: 1,
    totalBytes: 1,
  });

  return { status: "MOCK_SUCCESS" };
};

export const restartApp = () => {};
