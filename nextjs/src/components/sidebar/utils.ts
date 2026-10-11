export const matchesSelectedPath = (index: string, candidate: any) =>
  [candidate?.path, candidate?.name, candidate?.label].some(
    (value) => String(index) === String(value ?? ""),
  );