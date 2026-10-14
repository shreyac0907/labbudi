import gsap from 'gsap';

// GSAP page transitions. Every routed page is wrapped in a `.page-container`
// (see components/PageTransition.jsx): it fades/scales IN when it mounts, and
// anything that navigates calls navigateWithTransition() so it fades/scales
// OUT first.
//
// `leaving` stops a second click mid-fade from queueing a second navigation;
// it is cleared the moment the next page's enter animation starts.
let leaving = false;

export function playPageEnter(el) {
  leaving = false;
  return gsap.from(el ?? '.page-container', {
    opacity: 0,
    scale: 0.97,
    duration: 0.35,
    ease: 'power2.out',
    // clears the inline styles afterwards so position:fixed descendants
    // aren't left inside a transformed ancestor
    clearProps: 'all',
  });
}

export function navigateWithTransition(navigate, path, options) {
  const current = window.location.pathname + window.location.search;
  if (leaving || current === path) return;
  leaving = true;
  gsap.to('.page-container', {
    opacity: 0,
    scale: 0.97,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: () => navigate(path, options),
  });
}
