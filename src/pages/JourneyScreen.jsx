import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AssetImage from '../components/AssetImage';
import SpeechBubble from '../components/SpeechBubble';
import CorkBoard from '../components/CorkBoard';
import LabBoard, { LAB_BOARD_INSET } from '../components/LabBoard';
import PanTransition from '../components/PanTransition';
import { NoteCardWithClip, PostIt } from '../components/corkboard/PostIt';
import { Pin } from '../components/corkboard/Pin';
import { WashiTape } from '../components/corkboard/WashiTape';
import { StarSticker, Starburst, StampBadge } from '../components/corkboard/Stickers';
import HazardCard from '../components/journey/HazardCard';
import DragMatchEquipment from '../components/journey/DragMatchEquipment';
import WetLab from '../components/journey/WetLab';
import ResultsGraph from '../components/journey/ResultsGraph';
import RampLab from '../components/journey/RampLab';
import RampResults from '../components/journey/RampResults';
import { RampSVG, BlockSVG, NewtonMeterSVG, ClampStandSVG, StringSVG } from '../components/journey/RampEquipment';
import BunsenLab from '../components/journey/BunsenLab';
import BunsenResults from '../components/journey/BunsenResults';
import {
  BunsenBurnerSVG,
  TripodSVG,
  GauzeMatSVG,
  EvaporatingDishSVG,
  HeatProofMatSVG,
  SafetyGogglesSVG,
  SpatulaSVG,
} from '../components/journey/BunsenEquipment';
import SummaryCards from '../components/journey/SummaryCards';
import MicroscopeLab from '../components/journey/MicroscopeLab';
import MicroscopeResults from '../components/journey/MicroscopeResults';
import {
  MicroscopeSVG,
  GlassSlideSVG,
  CoverslipSVG,
  IodineBottleSVG,
  OnionLayerSVG,
  ForcepsSVG,
  DropperSVG,
} from '../components/journey/MicroscopeEquipment';
import CircuitLab from '../components/journey/CircuitLab';
import CircuitResults from '../components/journey/CircuitResults';
import {
  BatterySVG,
  BulbSVG,
  SwitchSVG,
  AmmeterSVG,
  VoltmeterSVG,
  MotorSVG,
  WiresSVG,
  CircuitMatSVG,
} from '../components/journey/CircuitEquipment';
import Reflection from '../components/journey/Reflection';
import { PRACTICALS, SUBJECT_META, SUBJECT_PIN } from '../config/practicals';
import { ASSETS } from '../config/assets';
import { zoomOrigin } from '../utils/zoomNav';
import { y7p1 } from '../data/y7p1';
import { y7p2 } from '../data/y7p2';
import { y7p3 } from '../data/y7p3';
import { y7p4 } from '../data/y7p4';
import { y7p5 } from '../data/y7p5';

const TOTAL_SCREENS = 7;
const WET_LAB_INDEX = 3;
const RESULTS_INDEX = 4;
const THEORY_INDEX = 5;
const REFLECTION_INDEX = 6;

const PRACTICAL_CONTENT = {
  y7_0: y7p1,
  y7_1: y7p2,
  y7_2: y7p3,
  y7_3: y7p4,
  y7_4: y7p5,
};

// Screen 5 and Screen 6 are bespoke per practical (each has its own
// interactive mechanic); Screen 7's "go deeper" diagram is too. Screens
// 1-4 and 8 are fully data-driven and shared via the generic components below.
const WET_LAB_COMPONENTS = {
  y7_0: WetLab,
  y7_1: RampLab,
  y7_2: BunsenLab,
  y7_3: MicroscopeLab,
  y7_4: CircuitLab,
};
const RESULTS_COMPONENTS = {
  y7_0: ResultsGraph,
  y7_1: RampResults,
  y7_2: BunsenResults,
  y7_3: MicroscopeResults,
  y7_4: CircuitResults,
};
const EQUIPMENT_ICONS = {
  y7_1: { ramp: RampSVG, block: BlockSVG, newton_meter: NewtonMeterSVG, clamp_stand: ClampStandSVG, string: StringSVG },
  y7_4: {
    circuit_battery: BatterySVG,
    circuit_bulb: BulbSVG,
    circuit_switch_open: SwitchSVG,
    circuit_ammeter: AmmeterSVG,
    circuit_voltmeter: VoltmeterSVG,
    circuit_motor: MotorSVG,
    wires: WiresSVG,
    circuit_mat: CircuitMatSVG,
  },
  y7_3: {
    microscope: MicroscopeSVG,
    glass_slide: GlassSlideSVG,
    coverslip: CoverslipSVG,
    iodine_bottle: IodineBottleSVG,
    onion_layer: OnionLayerSVG,
    forceps: ForcepsSVG,
    dropper: DropperSVG,
  },
  y7_2: {
    bunsen_burner: BunsenBurnerSVG,
    tripod: TripodSVG,
    gauze_mat: GauzeMatSVG,
    evaporating_dish: EvaporatingDishSVG,
    heat_proof_mat: HeatProofMatSVG,
    safety_goggles: SafetyGogglesSVG,
    spatula: SpatulaSVG,
  },
};

function checkpointKey(year, practicalId) {
  return `labbudi_${year}_${practicalId}_progress`;
}

function GpsTag({ skill, label = 'Skill' }) {
  if (!skill) return null;
  return (
    <div
      style={{
        marginTop: 20,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: 999,
        padding: '6px 14px 6px 8px',
      }}
    >
      <StarSticker color="teal" size={20} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-mid)' }}>
        {label}: {skill}
      </span>
    </div>
  );
}

function IntroScreen({ data }) {
  return (
    <>
      <h1 className="heading" style={{ fontSize: 28 }}>
        {data.title}
      </h1>
      <div
        style={{
          marginTop: 16,
          background: '#FFF8E1',
          border: '1px solid #F0DFA0',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            lineHeight: 1.7,
            margin: 0,
            color: 'var(--color-dark)',
          }}
        >
          {data.concept}
        </p>
      </div>
      <GpsTag skill={data.gpsSkill} />
    </>
  );
}

function RiskAssessmentScreen({ data, revealedIds, onReveal }) {
  return (
    <>
      <h1 className="heading" style={{ fontSize: 26 }}>
        {data.title}
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
        {data.hazards.map((hazard) => (
          <HazardCard key={hazard.id} hazard={hazard} onRevealed={onReveal} />
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#999', marginTop: 10 }}>
        {revealedIds.size} / {data.hazards.length} revealed
      </p>
      <GpsTag skill={data.gpsSkill} />
    </>
  );
}

function EquipmentScreen({ data, onFeedback, onAllMatched, icons }) {
  return (
    <>
      <h1 className="heading" style={{ fontSize: 26 }}>
        {data.title}
      </h1>
      <DragMatchEquipment
        items={data.items}
        wrongMatchText={data.wrongMatchText}
        onFeedback={onFeedback}
        onAllMatched={onAllMatched}
        icons={icons}
      />
      <GpsTag skill={data.gpsSkill} />
    </>
  );
}

function ResultsScreen({ data, year, practicalId, onFeedback, onAllPlaced, ResultsComponent }) {
  return (
    <>
      <h1 className="heading" style={{ fontSize: 26 }}>
        {data.title}
      </h1>
      <ResultsComponent
        year={year}
        practicalId={practicalId}
        errorText={data.graphErrorText}
        onFeedback={onFeedback}
        onAllPlaced={onAllPlaced}
      />
      <GpsTag skill={data.gpsSkill} label="Skills" />
    </>
  );
}

// The 8 pin heads tracking progress through a practical, strung along the
// top of the wood frame — current is bigger/full colour, completed gets a
// tiny "done" stamp overlay, upcoming sits greyed out.
function ProgressPins({ total, current, pinColor, inset = 0 }) {
  return (
    <div style={{ position: 'fixed', top: inset + 10, left: '50%', transform: 'translateX(-50%)', zIndex: 60, display: 'flex', gap: 10 }}>
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === current;
        const isDone = i < current;
        return (
          <div key={i} style={{ position: 'relative' }}>
            <Pin
              color={isCurrent || isDone ? pinColor : 'red'}
              size={isCurrent ? 20 : 14}
              style={{ opacity: isCurrent || isDone ? 1 : 0.35, filter: isCurrent || isDone ? 'none' : 'grayscale(1)' }}
            />
            {isDone && (
              <div style={{ position: 'absolute', top: -6, left: -6, transform: 'scale(0.34)', transformOrigin: 'top left' }}>
                <StampBadge kind="done" size={56} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkipToResults({ onClick, inset = 0 }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: inset + 44,
        right: inset + 20,
        zIndex: 60,
        background: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: 999,
        padding: '6px 16px',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--color-start)',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      Skip to Results →
    </button>
  );
}

function BackWashi({ onClick, inset = 0 }) {
  return (
    <div onClick={onClick} style={{ position: 'fixed', top: inset + 50, left: inset + 20, zIndex: 60, cursor: 'pointer' }}>
      <div style={{ position: 'relative', width: 78, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <WashiTape variant="blue_dots" width={78} />
        <span style={{ position: 'absolute', fontFamily: 'var(--font-heading)', fontSize: 15, color: '#2A4A6C' }}>← Back</span>
      </div>
    </div>
  );
}

// Pip, pinned to his own post-it in the corner of the cluster, with his
// speech bubble popping out from behind the note.
function PipCluster({ text, visible, variant, inset = 0 }) {
  return (
    <div style={{ position: 'fixed', bottom: inset + 20, right: inset + 20, zIndex: 40 }}>
      <div style={{ position: 'relative', width: 130 }}>
        <SpeechBubble
          text={text}
          visible={visible && !!text}
          maxWidth={220}
          style={{ bottom: '85%', right: 10, left: 'auto', zIndex: 0 }}
          pointerStyle={{ left: 'auto', right: 24, transform: 'none' }}
        />
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
          <Pin color="red" size={18} />
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <PostIt color="green" width={130} rotate={-3}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', paddingTop: 10 }}>
              <AssetImage src={ASSETS.characters.pip[variant] ?? ASSETS.characters.pip.speaking} alt="Pip" width={82} height={82} />
            </div>
          </PostIt>
        </div>
      </div>
    </div>
  );
}

export default function JourneyScreen() {
  const { year, id } = useParams();
  const practicalId = Number(id);
  const navigate = useNavigate();

  const contentKey = `${year}_${id}`;
  const content = PRACTICAL_CONTENT[contentKey];
  const hasContent = !!content;
  const practicalMeta = PRACTICALS[year]?.list?.[practicalId];
  const fallbackTitle = practicalMeta?.title ?? 'Practical';
  const subject = practicalMeta?.subject ?? 'chem';
  const pinColor = SUBJECT_PIN[subject] ?? 'red';
  const WetLabComponent = WET_LAB_COMPONENTS[contentKey] ?? WetLab;
  const ResultsComponent = RESULTS_COMPONENTS[contentKey] ?? ResultsGraph;
  const equipmentIcons = EQUIPMENT_ICONS[contentKey];

  const [screenIndex, setScreenIndex] = useState(0);
  const [panDirection, setPanDirection] = useState('forward');
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [lastCheckpoint, setLastCheckpoint] = useState(0);

  const [revealedHazardIds, setRevealedHazardIds] = useState(() => new Set());
  const [equipmentMatched, setEquipmentMatched] = useState(false);
  const [graphComplete, setGraphComplete] = useState(false);
  const [theoryDone, setTheoryDone] = useState(false);
  const [pipText, setPipText] = useState('');
  const [pipVariant, setPipVariant] = useState('speaking');

  const prevScreenRef = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem(checkpointKey(year, id));
    const storedIndex = stored !== null ? Number(stored) : 0;
    if (storedIndex > 0) {
      setLastCheckpoint(storedIndex);
      setShowResumePrompt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, id]);

  useEffect(() => {
    localStorage.setItem(checkpointKey(year, id), String(screenIndex));
  }, [year, id, screenIndex]);

  useEffect(() => {
    setPipVariant('speaking');
    if (!hasContent) {
      setPipText('');
      return;
    }
    if (screenIndex === 0) setPipText(content.screens.intro.analogy);
    else if (screenIndex === 1) setPipText(content.screens.riskAssessment.pipIntro);
    else if (screenIndex === 2) setPipText(content.screens.equipment.introText);
    else if (screenIndex === RESULTS_INDEX) setPipText("Let's see what we found!");
    else if (screenIndex === REFLECTION_INDEX) setPipText(content.screens.reflection.pipIntro);
    else setPipText('');
  }, [screenIndex, hasContent, content]);

  function goToScreen(index) {
    const clamped = Math.min(Math.max(index, 0), TOTAL_SCREENS - 1);
    setPanDirection(clamped >= prevScreenRef.current ? 'forward' : 'back');
    prevScreenRef.current = clamped;
    setScreenIndex(clamped);
  }

  function handleBack(e) {
    if (screenIndex === 0) {
      navigate(`/corkboard/${year}`, { state: e ? zoomOrigin(e) : undefined });
    } else {
      goToScreen(screenIndex - 1);
    }
  }

  function handleHazardReveal(hazardId) {
    setRevealedHazardIds((prev) => new Set(prev).add(hazardId));
  }

  function isScreenComplete(index) {
    if (!hasContent) return true;
    if (index === 1) return revealedHazardIds.size >= content.screens.riskAssessment.hazards.length;
    if (index === 2) return equipmentMatched;
    if (index === RESULTS_INDEX) return graphComplete;
    if (index === THEORY_INDEX) return theoryDone;
    return true;
  }

  const canAdvance = isScreenComplete(screenIndex);
  const showPipCluster = screenIndex !== WET_LAB_INDEX && screenIndex !== THEORY_INDEX;
  const showSharedButton = screenIndex !== REFLECTION_INDEX;

  if (hasContent && screenIndex === WET_LAB_INDEX) {
    // P1's Wet Lab has been rebuilt as a self-contained multi-slide split-board
    // screen (Screen5Layout) that owns its own frame, nav and chrome — it does
    // not get wrapped in the old LabBoard shell. The other practicals' Wet Labs
    // haven't been migrated yet and keep the previous LabBoard-wrapped pattern.
    if (contentKey === 'y7_0') {
      return (
        <WetLabComponent
          year={year}
          practicalId={id}
          wetLabDialogue={content.wetLabDialogue}
          onBack={handleBack}
          onContinue={() => goToScreen(screenIndex + 1)}
        />
      );
    }
    return (
      <LabBoard>
        <WetLabComponent
          year={year}
          practicalId={id}
          wetLabDialogue={content.wetLabDialogue}
          onContinue={() => goToScreen(screenIndex + 1)}
        />
        <ProgressPins total={TOTAL_SCREENS} current={screenIndex} pinColor={pinColor} inset={LAB_BOARD_INSET} />
        <BackWashi onClick={handleBack} inset={LAB_BOARD_INSET} />
        <SkipToResults onClick={() => goToScreen(RESULTS_INDEX)} inset={LAB_BOARD_INSET} />
      </LabBoard>
    );
  }

  function renderScreenBody() {
    if (!hasContent) {
      return (
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <h2 className="heading">
            {fallbackTitle} — Screen {screenIndex + 1}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-mid)' }}>
            This screen's content will be built in a future session.
          </p>
        </div>
      );
    }
    if (screenIndex === 0) return <IntroScreen data={content.screens.intro} />;
    if (screenIndex === 1) {
      return (
        <RiskAssessmentScreen
          data={content.screens.riskAssessment}
          revealedIds={revealedHazardIds}
          onReveal={handleHazardReveal}
        />
      );
    }
    if (screenIndex === 2) {
      return (
        <EquipmentScreen
          data={content.screens.equipment}
          onFeedback={setPipText}
          onAllMatched={() => setEquipmentMatched(true)}
          icons={equipmentIcons}
        />
      );
    }
    if (screenIndex === RESULTS_INDEX) {
      return (
        <ResultsScreen
          data={content.screens.results}
          year={year}
          practicalId={id}
          onFeedback={setPipText}
          onAllPlaced={() => setGraphComplete(true)}
          ResultsComponent={ResultsComponent}
        />
      );
    }
    if (screenIndex === THEORY_INDEX) {
      return <SummaryCards data={content.screens.summary} subject={subject} onAllDone={() => setTheoryDone(true)} />;
    }
    if (screenIndex === REFLECTION_INDEX) {
      return (
        <Reflection
          year={year}
          practicalId={id}
          data={content.screens.reflection}
          onFeedback={setPipText}
          onPipVariant={setPipVariant}
          onBackToNotebook={() => navigate(`/corkboard/${year}`)}
        />
      );
    }
    return null;
  }

  return (
    <CorkBoard ambientDeco={screenIndex === THEORY_INDEX}>
      <div className="page-root">
        <ProgressPins total={TOTAL_SCREENS} current={screenIndex} pinColor={pinColor} inset={56} />
        <BackWashi onClick={handleBack} inset={56} />

        <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', zIndex: 15, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
              <Pin color={pinColor} size={20} />
            </div>
            <NoteCardWithClip width={300} height={70}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '0 16px' }}>
                <span
                  className="heading"
                  style={{ fontSize: 15, color: SUBJECT_META[subject].color, textAlign: 'center', lineHeight: 1.2 }}
                >
                  {fallbackTitle}
                </span>
              </div>
            </NoteCardWithClip>
          </div>
        </div>

        <div
          style={{
            maxWidth: 'min(680px, 100%)',
            margin: '0 auto',
            padding: '175px 40px 120px',
            height: '100%',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <PanTransition screenKey={screenIndex} direction={panDirection}>
              <div
                style={{
                  background: '#FFF8E7',
                  border: '1.5px solid #E4D3AC',
                  borderRadius: 18,
                  padding: 28,
                  position: 'relative',
                  boxShadow: '2px 6px 18px rgba(0,0,0,0.15)',
                }}
              >
                {renderScreenBody()}

                {showSharedButton && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                    <button
                      disabled={!canAdvance || screenIndex === TOTAL_SCREENS - 1}
                      onClick={() => goToScreen(screenIndex + 1)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: canAdvance ? 'pointer' : 'not-allowed' }}
                    >
                      <Starburst
                        width={120}
                        color={canAdvance ? 'var(--color-start)' : '#C9BFA8'}
                        wobble={canAdvance}
                      >
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: '#fff' }}>
                          {screenIndex === 0
                            ? 'Continue →'
                            : screenIndex === THEORY_INDEX
                            ? 'Head to Reflection →'
                            : 'Next →'}
                        </span>
                      </Starburst>
                    </button>
                  </div>
                )}
              </div>
            </PanTransition>
          </AnimatePresence>
        </div>

        {showPipCluster && <PipCluster text={pipText} visible={!!pipText} variant={pipVariant} inset={56} />}

        {showResumePrompt && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(45,45,45,0.35)',
              zIndex: 150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 320, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15 }}>
                Continue from Screen {lastCheckpoint + 1}?
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                <button
                  onClick={() => {
                    goToScreen(lastCheckpoint);
                    setShowResumePrompt(false);
                  }}
                >
                  Yes
                </button>
                <button onClick={() => setShowResumePrompt(false)}>Start Over</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CorkBoard>
  );
}
