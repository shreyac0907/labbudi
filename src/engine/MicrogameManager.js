// Registry of every microgame type. PracticalEngine / MicrogameRenderer
// call MicrogameManager.launch(step.type, ...) to get the component to
// render — they never import a microgame directly.

import DragGame from '../microgames/DragGame';
import SqueezeGame from '../microgames/SqueezeGame';
import ObserveGame from '../microgames/ObserveGame';
import RecordGame from '../microgames/RecordGame';
import TapGame from '../microgames/TapGame';
import HoldGame from '../microgames/HoldGame';
import SwipeGame from '../microgames/SwipeGame';
import CircularGame from '../microgames/CircularGame';
import SliderGame from '../microgames/SliderGame';
import RotateGame from '../microgames/RotateGame';
import ZoomReadGame from '../microgames/ZoomReadGame';
import ProtractorGame from '../microgames/ProtractorGame';
import SequenceTapGame from '../microgames/SequenceTapGame';
import TimerWatchGame from '../microgames/TimerWatchGame';
import DrawSwabGame from '../microgames/DrawSwabGame';
import ScrollKnobGame from '../microgames/ScrollKnobGame';
import DragConnectGame from '../microgames/DragConnectGame';
import ReadMeterGame from '../microgames/ReadMeterGame';
import PipetteDrawGame from '../microgames/PipetteDrawGame';
import LitmusGame from '../microgames/LitmusGame';
import ScrapbookPageGame from '../microgames/ScrapbookPageGame';
import RampAngleGame from '../microgames/RampAngleGame';
import LightBunsenGame from '../microgames/LightBunsenGame';
import HeatObserveGame from '../microgames/HeatObserveGame';
import ReverseReactionGame from '../microgames/ReverseReactionGame';
import StainSlideGame from '../microgames/StainSlideGame';
import MicroscopeStageGame from '../microgames/MicroscopeStageGame';
import MicroscopeExploreGame from '../microgames/MicroscopeExploreGame';
import CoverslipGame from '../microgames/CoverslipGame';
import FlameEducationGame from '../microgames/FlameEducationGame';
import CircuitBuilderGame from '../microgames/CircuitBuilderGame';
import ZeroMeterGame from '../microgames/ZeroMeterGame';
import TieKnotGame from '../microgames/TieKnotGame';
import ForceTableGame from '../microgames/ForceTableGame';
import GraphPartsGame from '../microgames/GraphPartsGame';
import BestFitGame from '../microgames/BestFitGame';
import CellQuizGame from '../microgames/CellQuizGame';
import SpeedRoundGame from '../microgames/SpeedRoundGame';

export const microgames = {
  drag: DragGame,
  squeeze: SqueezeGame,
  observe: ObserveGame,
  record: RecordGame,
  tap: TapGame,
  hold: HoldGame,
  swipe: SwipeGame,
  circular: CircularGame,
  slider: SliderGame,
  rotate: RotateGame,
  zoom_read: ZoomReadGame,
  protractor: ProtractorGame,
  sequence_tap: SequenceTapGame,
  timer_watch: TimerWatchGame,
  draw_swab: DrawSwabGame,
  scroll_knob: ScrollKnobGame,
  drag_connect: DragConnectGame,
  read_meter: ReadMeterGame,
  draw_pipette: PipetteDrawGame,
  litmus_test: LitmusGame,
  scrapbook_placeholder: ScrapbookPageGame,
  ramp_angle: RampAngleGame,
  light_bunsen: LightBunsenGame,
  heat_observe: HeatObserveGame,
  reverse_reaction: ReverseReactionGame,
  stain_slide: StainSlideGame,
  microscope_stage: MicroscopeStageGame,
  microscope_explore: MicroscopeExploreGame,
  coverslip: CoverslipGame,
  flame_education: FlameEducationGame,
  circuit_builder: CircuitBuilderGame,
  zero_meter: ZeroMeterGame,
  tie_knot: TieKnotGame,
  force_table: ForceTableGame,
  graph_parts: GraphPartsGame,
  best_fit: BestFitGame,
  cell_quiz: CellQuizGame,
  speed_round: SpeedRoundGame,
};

export function launch(type) {
  const Component = microgames[type];
  if (!Component) {
    throw new Error(`MicrogameManager: unknown microgame type "${type}"`);
  }
  return Component;
}

const MicrogameManager = { microgames, launch };

export default MicrogameManager;
