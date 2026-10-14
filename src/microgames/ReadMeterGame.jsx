import ZoomReadGame from './ZoomReadGame';

// An ammeter/voltmeter reading is the exact same "zoom in, pick the tick
// the needle sits on" interaction as reading a Newton meter — the meter
// component already takes a `unit` prop, so this is a thin rename rather
// than a second implementation, kept as its own microgame type only so
// practical data reads clearly ("read_meter" vs "zoom_read").
export default function ReadMeterGame(props) {
  return <ZoomReadGame {...props} />;
}
