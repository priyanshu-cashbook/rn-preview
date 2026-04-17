type Platform = "ios" | "android";

type RemoteDeploymentPackage = {
  description?: string;
  appVersion?: string;
  label?: string;
};

type RemoteDeployment = {
  id: string;
  key: string;
  name: string;
  createdTime?: string;
  package?: RemoteDeploymentPackage;
};

type CatalogEntry = {
  id: string;
  name: string;
  envVar: string;
};

const seedCatalog: CatalogEntry[] = [
  { id: "production", name: "Production", envVar: "REVOPUSH_PRODUCTION_KEY" },
  { id: "staging", name: "Staging", envVar: "REVOPUSH_STAGING_KEY" },
  {
    id: "preview-feature-x",
    name: "preview-feature-x",
    envVar: "REVOPUSH_PREVIEW_FEATURE_X_KEY",
  },
  {
    id: "preview-payments",
    name: "preview-payments-redesign",
    envVar: "REVOPUSH_PREVIEW_PAYMENTS_KEY",
  },
];

const platformSuffix = (platform: Platform | undefined) => {
  if (platform === "ios") return "_IOS";
  if (platform === "android") return "_ANDROID";
  return "";
};

const readKey = (envVar: string, suffix: string) =>
  (suffix && process.env[`${envVar}${suffix}`]) || process.env[envVar] || "";

const parseDynamic = (): RemoteDeployment[] => {
  const raw = process.env.REVOPUSH_DYNAMIC_DEPLOYMENTS;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      if (
        !item ||
        typeof item.id !== "string" ||
        typeof item.name !== "string" ||
        typeof item.key !== "string" ||
        item.key.length === 0
      ) {
        return [];
      }

      return [
        {
          id: item.id,
          name: item.name,
          key: item.key,
          createdTime:
            typeof item.createdTime === "string" ? item.createdTime : undefined,
          package:
            item.package && typeof item.package === "object"
              ? (item.package as RemoteDeploymentPackage)
              : undefined,
        },
      ];
    });
  } catch {
    return [];
  }
};

export async function POST(request: Request) {
  let platform: Platform | undefined;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      platform?: Platform;
    };
    platform = body.platform;
  } catch {
    platform = undefined;
  }

  const suffix = platformSuffix(platform);

  const seeds: RemoteDeployment[] = seedCatalog.flatMap((entry) => {
    const key = readKey(entry.envVar, suffix);
    if (!key) return [];
    return [
      {
        id: entry.id,
        name: entry.name,
        key,
      },
    ];
  });

  const data = [...seeds, ...parseDynamic()];

  return Response.json({ success: true, data });
}

export async function GET() {
  return Response.json(
    {
      success: false,
      error: "Use POST with { platform: 'ios' | 'android' }",
    },
    { status: 405 }
  );
}
