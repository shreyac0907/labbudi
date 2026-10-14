import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { playPageEnter } from '../utils/pageTransition';

// Wraps one routed page. App.jsx keys this by pathname, so every route change
// mounts a fresh container and the GSAP enter animation plays once per page.
export default function PageTransition({ children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    // a context so cleanup *reverts* the inline opacity/transform; React
    // StrictMode mounts, cleans up and mounts again, and a merely-killed
    // gsap.from() would leave the page stuck at its start state
    const ctx = gsap.context(() => playPageEnter(ref.current));
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="page-container">
      {children}
    </div>
  );
}
