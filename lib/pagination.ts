export const encodeCursor = (created_at: string, id: string): string => {
  return Buffer.from(`${created_at}:${id}`).toString("base64");
};

export const decodeCursor = (
  cursor: string
): { created_at: string; id: string } | null => {
  try {
    const decoded = Buffer.from(cursor, "base64").toString();
    const [created_at, id] = decoded.split(":");
    if (!created_at || !id) return null;
    return { created_at, id };
  } catch {
    return null;
  }
};

export const DEFAULT_LIMIT = 10;
