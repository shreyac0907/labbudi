// Shared icon set for the bottom step strip. Every icon is a small,
// immediately-recognisable illustration of the equipment/action for that
// step type — not an abstract glyph. Keys cover both the new Cooking-Mama
// pass vocabulary (safety/squeeze/pour/...) AND every iconType value that
// already exists across the data files (angle/pull/magnifier/notepad/...),
// so nothing regresses to the blank-dot fallback.
export default function StepIcon({ type, color = '#2D2D2D', size = 28 }) {
  const s = size;
  const common = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (type) {
    // shield with a tick — hazard/safety
    case 'safety':
    case 'hazard':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M12 3 L20 6.5 V11.5 C20 16.5 16.5 19.8 12 21 C7.5 19.8 4 16.5 4 11.5 V6.5 Z" />
          <path d="M8.5 12 L11 14.5 L16 9" />
        </svg>
      );

    // dropper with a drop falling
    case 'squeeze':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M10 2 H14 V6 L12 9 L10 6 Z" />
          <rect x="9" y="8" width="6" height="7" rx="2" />
          <path d="M12 17 C12 17 10.5 19 10.5 20.2 C10.5 21.2 11.2 22 12 22 C12.8 22 13.5 21.2 13.5 20.2 C13.5 19 12 17 12 17 Z" fill={color} stroke="none" />
        </svg>
      );

    // tilted container pouring liquid
    case 'pour':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M5 4 L15 8 L13 15 L4 12 Z" transform="rotate(-18 9 9)" />
          <path d="M15 9 C17 12 18 15 19 20" />
          <circle cx="19.3" cy="21" r="0.6" fill={color} stroke="none" />
        </svg>
      );

    // circular arrow — rotate
    case 'rotate':
    case 'focus_knob':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M19 8 A8 8 0 1 0 20 13" />
          <path d="M19 3 V8 H14" />
        </svg>
      );

    // hand gripping, arrow above — hold/pull
    case 'hold_pull':
    case 'pull':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="15" r="5" />
          <path d="M12 10 L12 3 M9 6 L12 3 L15 6" />
        </svg>
      );

    // magnifier over a scale/dial
    case 'zoom_read':
    case 'magnifier':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <circle cx="10" cy="10" r="6" />
          <path d="M7 10 L13 10 M10 7 L10 13" strokeWidth="1.2" opacity="0.6" />
          <path d="M15 15 L20 20" />
        </svg>
      );

    // notepad with pencil — record
    case 'record':
    case 'notepad':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <rect x="4" y="3" width="13" height="18" rx="2" />
          <path d="M7 8 L14 8 M7 12 L14 12 M7 16 L11 16" strokeWidth="1.4" />
          <path d="M16 15 L21 10 L22.5 11.5 L17.5 16.5 L15.5 17 Z" fill={color} stroke="none" />
        </svg>
      );

    // eye — observe
    case 'observe':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M2 12 C5 6 19 6 22 12 C19 18 5 18 2 12 Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );

    // finger tapping
    case 'tap':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M13 3 V13" />
          <path d="M13 13 C13 13 10 12 9 13.5 C8 15 9.5 16 10.5 17.5 L12.5 21 H18 C19 19 19.5 17 19.5 15 V8 C19.5 7 18.5 6.5 17.8 7.2 L17 8" />
          <path d="M9 4 L9 7 M6 6 L8 8" strokeWidth="1.4" opacity="0.6" />
        </svg>
      );

    // cotton swab
    case 'swab':
    case 'draw_swab':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <line x1="12" y1="7" x2="12" y2="20" />
          <circle cx="12" cy="4.5" r="3" />
        </svg>
      );

    // lit match
    case 'match_strike':
    case 'flame':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M12 2 C8 8 6 10 6 14 a6 6 0 0 0 12 0 c0-3-2-4-3-6 c0 2-1 3-2 2 c-1-1 0-3-1-8z" />
        </svg>
      );

    // small glass square at an angle — coverslip
    case 'coverslip':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <rect x="6" y="8" width="13" height="9" rx="1" transform="rotate(-14 12.5 12.5)" fillOpacity="0.15" fill={color} />
          <line x1="4" y1="19" x2="20" y2="19" strokeWidth="1.4" opacity="0.6" />
        </svg>
      );

    // wire with two terminals — connect
    case 'connect_wire':
    case 'drag_connect':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <circle cx="5" cy="12" r="2.4" fill={color} stroke="none" />
          <circle cx="19" cy="12" r="2.4" fill={color} stroke="none" />
          <path d="M7.2 12 H16.8" />
        </svg>
      );

    // axes with a rising line
    case 'graph':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M4 3 V20 H21" />
          <path d="M7 16 L12 11 L15 13 L20 6" />
        </svg>
      );

    // a table
    case 'table':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10 H21 M3 14.5 H21 M12 5 V19" />
        </svg>
      );

    // a knot in a string
    case 'knot':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M2 17 C6 17 8 13 11 11 C14 9 17 11 15 14 C13 17 8 15 9 11 C10 7 15 6 22 7" />
        </svg>
      );

    // existing iconType values kept intact
    case 'angle':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M4 20 A16 16 0 0 1 20 20" />
          <path d="M12 20 L12 8" />
          <path d="M12 20 L19 13" />
        </svg>
      );
    case 'mat':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <rect x="3" y="8" width="18" height="8" rx="2" />
        </svg>
      );
    case 'tripod':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M12 4 L4 20 M12 4 L20 20 M12 4 L12 20" />
        </svg>
      );
    case 'grid':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <rect x="4" y="4" width="16" height="16" />
          <path d="M4 10 L20 10 M4 16 L20 16 M10 4 L10 20 M16 4 L16 20" strokeWidth="1.4" />
        </svg>
      );
    case 'bowl':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <path d="M3 10 Q12 20 21 10" />
          <path d="M3 10 L21 10" />
        </svg>
      );
    case 'drag':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill={color} stroke="none">
          <circle cx="12" cy="7" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="17" r="2" />
        </svg>
      );
    case 'scroll_knob':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 6 V9 M12 12 L15 14" />
        </svg>
      );

    default:
      return <div style={{ width: s * 0.4, height: s * 0.4, borderRadius: '50%', background: color }} />;
  }
}
