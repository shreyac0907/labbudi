// "Understand" steps are the "What does it mean?" notes at the end of each practical:
// tap-type steps whose cards carry `content` (notes) and whose id says meaning/understand (or that set `scrapbook: true`).
// They are shown as an interactive slide deck (UnderstandSlides) rather than flashcards,
// and have no character guide.
export function isUnderstandStep(step) {
  const targets = step?.parameters?.targets;
  return (
    step?.type === 'tap' &&
    Array.isArray(targets) &&
    targets.length > 0 &&
    targets.every((t) => typeof t.content === 'string') &&
    (/meaning|understand/i.test(step.id ?? '') || step.parameters.scrapbook === true)
  );
}

// Steps with no character guide column (and none of its scenery): the understand slides and the
// scrapbook page, which both use the whole canvas.
export function isGuideFreeStep(step) {
  return isUnderstandStep(step) || step?.type === 'scrapbook_placeholder';
}
