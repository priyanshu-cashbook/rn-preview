import codePush from "@revopush/react-native-code-push";
import type { ComponentType } from "react";

type CodePushDecorator = <TProps>(
  options: {
    checkFrequency: number;
  }
) => (component: ComponentType<TProps>) => ComponentType<TProps>;

type CodePushRuntime = CodePushDecorator & {
  CheckFrequency: {
    MANUAL: number;
  };
  InstallMode: {
    IMMEDIATE: number;
  };
  SyncStatus: Record<string, number>;
  sync: (
    options: {
      deploymentKey?: string;
      installMode?: number;
    },
    statusChanged?: (status: number) => void,
    downloadProgress?: (progress: {
      receivedBytes: number;
      totalBytes: number;
    }) => void
  ) => Promise<number>;
  getUpdateMetadata: () => Promise<{
    deploymentKey?: string;
    label?: string;
    description?: string;
  } | null>;
  restartApp: (onlyIfUpdateIsPending?: boolean) => void;
};

const typedCodePush = codePush as unknown as CodePushRuntime;

const syncStatusNames = Object.entries(typedCodePush.SyncStatus).reduce<
  Record<number, string>
>((accumulator, [name, value]) => {
  accumulator[value] = name;
  return accumulator;
}, {});

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
): ComponentType<TProps> =>
  (typedCodePush({
    checkFrequency: typedCodePush.CheckFrequency.MANUAL,
  })(component as ComponentType<unknown>) as ComponentType<TProps>);

export const isCodePushRuntimeAvailable = () => true;

export const getUpdateMetadata = async (): Promise<UpdateMetadata | null> =>
  typedCodePush.getUpdateMetadata();

export const syncToDeployment = async (
  deploymentKey: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> => {
  const statusCode = await typedCodePush.sync(
    {
      deploymentKey,
      installMode: typedCodePush.InstallMode.IMMEDIATE,
    },
    undefined,
    onProgress
  );

  const status = syncStatusNames[statusCode] ?? `STATUS_${statusCode}`;

  if (status === "UPDATE_INSTALLED") {
    typedCodePush.restartApp();
  }

  return { status };
};

export const restartApp = () => {
  typedCodePush.restartApp();
};
