// Converts the old flat-steps practical shape (steps[] + checkpointGroups[])
// into the new checkpoints[] + subSteps[] shape, so existing practicals
// (currently just y7p1) don't need to be hand-rewritten to work with the
// checkpoint-sequence engine — they're adapted automatically at load time.
export function adaptLegacyPractical(practical) {
  if (!practical) return practical;
  if (practical.checkpoints?.length && practical.checkpoints[0]?.subSteps) {
    return practical; // already native checkpoint shape
  }

  const steps = practical.steps ?? [];
  if (!steps.length) {
    return { ...practical, checkpoints: [] };
  }

  const groups = practical.checkpointGroups ?? [];
  const checkpoints = groups.length
    ? groups.map((g) => {
        const [start, end] = g.stepRange;
        return {
          id: g.id,
          name: g.name,
          isSavePoint: true,
          subSteps: steps.slice(start, end + 1).map((s) => ({ ...s, iconType: s.iconType ?? s.type })),
        };
      })
    : [{ id: 'all', name: practical.title, isSavePoint: true, subSteps: steps }];

  return { ...practical, checkpoints };
}
