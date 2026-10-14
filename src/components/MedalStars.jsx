// Medal rating as star emoji: gold = 3, silver = 2, bronze = 1. No medal shows a
// single greyed-out star so the slot never looks empty.
const COUNT = { gold: 3, silver: 2, bronze: 1 };

export default function MedalStars({ medal, style }) {
  const n = COUNT[medal] ?? 0;
  if (n === 0) {
    return (
      <span style={{ filter: 'grayscale(1)', opacity: 0.4, ...style }} aria-hidden="true">
        ⭐
      </span>
    );
  }
  return (
    <span style={style} aria-hidden="true">
      {'⭐'.repeat(n)}
    </span>
  );
}
