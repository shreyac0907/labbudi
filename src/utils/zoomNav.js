// Captures where a click happened (as viewport percentages) so the next
// route's CorkZoomTransition can pivot its scale animation from that exact
// point — e.g. the practical card the user just clicked "Start" on.
export function zoomOrigin(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return {
    originX: (cx / window.innerWidth) * 100,
    originY: (cy / window.innerHeight) * 100,
  };
}
