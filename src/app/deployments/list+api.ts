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

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || input.toLowerCase();

const resolveAppName = (platform: Platform | undefined) => {
  if (platform === "ios") return process.env.REVOPUSH_APP_NAME_IOS ?? "";
  return process.env.REVOPUSH_APP_NAME_ANDROID ?? "";
};

const normalizeCreatedTime = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return undefined;
};

const toRemoteDeployment = (raw: unknown): RemoteDeployment | null => {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as {
    name?: unknown;
    key?: unknown;
    createdTime?: unknown;
    package?: { label?: unknown; description?: unknown; appVersion?: unknown };
  };
  if (typeof d.name !== "string" || typeof d.key !== "string" || d.key.length === 0) {
    return null;
  }
  const pkg = d.package && typeof d.package === "object" ? d.package : undefined;
  return {
    id: slugify(d.name),
    name: d.name,
    key: d.key,
    createdTime: normalizeCreatedTime(d.createdTime),
    package: pkg
      ? {
          label: typeof pkg.label === "string" ? pkg.label : undefined,
          description:
            typeof pkg.description === "string" ? pkg.description : undefined,
          appVersion:
            typeof pkg.appVersion === "string" ? pkg.appVersion : undefined,
        }
      : undefined,
  };
};

const fetchLiveDeployments = async (
  platform: Platform | undefined,
): Promise<RemoteDeployment[]> => {
  const accessKey = process.env.REVOPUSH_ACCESS_KEY;
  const appName = resolveAppName(platform);
  if (!accessKey || !appName) return [];

  const serverUrl = (
    process.env.REVOPUSH_SERVER_URL ?? "https://api.revopush.org"
  ).replace(/\/+$/, "");
  const url = `${serverUrl}/apps/${encodeURIComponent(appName)}/deployments`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Revopush API ${response.status} ${response.statusText}: ${body.slice(0, 200)}`,
    );
  }

  const payload = (await response.json()) as unknown;
  const list = Array.isArray((payload as { deployments?: unknown[] })?.deployments)
    ? ((payload as { deployments: unknown[] }).deployments)
    : Array.isArray(payload)
      ? (payload as unknown[])
      : [];

  return list.flatMap((raw) => {
    const parsed = toRemoteDeployment(raw);
    return parsed ? [parsed] : [];
  });
};

const parseDynamic = (): RemoteDeployment[] => {
  const raw = process.env.REVOPUSH_DYNAMIC_DEPLOYMENTS;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const r = toRemoteDeployment(item);
      return r ? [r] : [];
    });
  } catch {
    return [];
  }
};

const dedupeByName = (items: RemoteDeployment[]): RemoteDeployment[] => {
  const seen = new Set<string>();
  const result: RemoteDeployment[] = [];
  for (const item of items) {
    const key = item.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
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

  try {
    const live = await fetchLiveDeployments(platform);
    const data = dedupeByName([...live, ...parseDynamic()]);
    return Response.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Revopush API error";
    const fallback = dedupeByName(parseDynamic());
    return Response.json(
      {
        success: fallback.length > 0,
        data: fallback,
        error: `Live deployment fetch failed: ${message}`,
      },
      { status: fallback.length > 0 ? 200 : 502 },
    );
  }
}

export async function GET() {
  return Response.json(
    {
      success: false,
      error: "Use POST with { platform: 'ios' | 'android' }",
    },
    { status: 405 },
  );
}
