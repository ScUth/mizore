export const matchesSelectedPath = (index: string, candidate: any) =>
  [candidate?.path, candidate?.name, candidate?.label].some(
    (value) => String(index) === String(value ?? ""),
  );
const normalize = (value: string) => {
  const trimmed = String(value ?? "").trim().replace(/\\/g, "/");
  const collapsed = `/${trimmed}`.replace(/\/+/g, "/");
  return collapsed.length > 1 ? collapsed.replace(/\/$/, "") : collapsed;
};

const isInside = (root: string, target: string) =>
  root === "/" || target === root || target.startsWith(`${root}/`);

export type PathGroup = { root: string; items: { path: any; index: number }[] };

/**
 * Group registered paths under the mounted folder (shared root) they live in.
 * Mirrors resolveSharedPath on the backend: the most specific root wins, and
 * rows that match no root are legacy paths relative to the first root.
 */
export function groupPathsByRoot(paths: any[], roots: string[]): PathGroup[] {
  const normalizedRoots = [...new Set(roots.map(normalize))];
  const byLength = [...normalizedRoots].sort((a, b) => b.length - a.length);
  const groups = new Map<string, PathGroup>(
    normalizedRoots.map((root) => [root, { root, items: [] }]),
  );

  paths.forEach((p, index) => {
    const target = normalize(p?.path ?? "");
    const root = byLength.find((r) => isInside(r, target)) ?? normalizedRoots[0] ?? "/";
    if (!groups.has(root)) groups.set(root, { root, items: [] });
    groups.get(root)!.items.push({ path: p, index });
  });

  return [...groups.values()];
}
