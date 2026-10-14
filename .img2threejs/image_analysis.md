# Image Analysis — Monocular Compound Microscope

References:
- ref1 (three_quarter_primary): /Users/shreya/Desktop/microscope .png — Krüss product shot, white background, 3/4 view, camera roughly at eye-level with the stage, slight elevation.
- ref2 (lab_use_detail): a-microscope-set-up-in-a-school-science-lab...S477JE.jpg — top-down/high-angle lab photo, nosepiece + stage + clips + slide in sharp focus, blue LED illuminator visible.
- ref3 (front_mirror_detail): microscope_ref3.png (ex-.avif) — near-front-on view of a different (mirror-based) student microscope body, used only for arm curvature / knob shapes / mirror geometry, not for the illuminator variant.

## Layer 1 — Identification & classification
- Object: monocular compound light microscope, student/school laboratory grade.
- Broad classification: mechanical optical instrument.
- primaryDomain: object.
- Confidence: 0.95 (unambiguous category across all three references).

## Layer 2 — Overall form & silhouette
- Overall bounding volume: a vertical assembly on a flat rectangular base, roughly 1:2.2
  width:height ratio (base footprint vs total height) in ref1.
- Primitives: cylinder (eyepiece tube, body tube, objective barrels, illuminator housing),
  extruded/lofted curve (the C-shaped arm), cuboid (base, stage), disc/cylinder (nosepiece,
  focus knobs), torus-ish concave dish (mirror).
- Symmetry: bilateral about the vertical plane through the eyepiece-to-base axis for the base/arm;
  the eyepiece tube and focus knobs break symmetry (eyepiece leans one lateral direction at ~45°,
  knobs sit on one side of the arm only, per ref1).
- Shape language: geometric, hard-surface, no organic curvature except the arm's single continuous
  C-curve and the mirror's concave dish.
- Aspect: eyepiece-tube-to-base height ratio is roughly 1:1.3 (eyepiece assembly ~ same order of
  magnitude as the base+arm height) in ref1.

## Layer 3 — Macro → meso → micro decomposition
- Macro: base, arm, body-tube-and-eyepiece assembly, nosepiece, stage, substage-illuminator (or
  mirror in the non-electric variant).
- Meso (per macro):
  - base: rectangular slab + 4 corner feet.
  - arm: single continuous curved member connecting base to body-tube pivot, carrying the focus
    knob cluster on its right face (as seen in ref1/ref3).
  - body-tube-and-eyepiece: angled eyepiece tube + ridged grip ring + straight vertical body tube.
  - nosepiece: revolving disc + 3 objective barrels.
  - stage: flat platform + aperture + 2 spring clips + (in ref2) mechanical stage translation
    screws.
  - substage: illuminator housing + ON/OFF toggle (ref2, electric variant) OR condenser housing +
    concave mirror on a hinge (ref3, mechanical variant).
- Micro: knurled grip rings on each objective barrel and on the focus knobs; colour bands on
  each objective (ref2 shows red/yellow-orange/blue bands clearly); ridged grip ring at the
  eyepiece-tube/body-tube joint (ref1); rubber feet texture at the base corners (ref1); a small
  set-screw / pivot bolt where the arm meets the base (ref3, visible as a circular disc fastener).

## Layer 4 — Spatial relationships (scene-graph)
- `<eyepiece, attached-to, body-tube>` — socket/flush joint, angled ~45° off the body tube's axis.
- `<body-tube, attached-to, nosepiece>` — flush cylindrical joint at the bottom of the tube.
- `<nosepiece, attached-to, arm>` (via the body tube) — the nosepiece sits below the body tube,
  itself carried by the arm's upper curve.
- `<objective_x4|x10|x40, attached-to, nosepiece>` — socket joints radially arranged around the
  nosepiece disc, each barrel pointing down toward the stage.
- `<coarseKnob, attached-to, arm>` — embedded in the arm's right face, coaxial with `fineKnob`.
- `<fineKnob, attached-to, arm>` — directly below coarseKnob, same face, smaller radius.
- `<stage, attached-to, arm>` — the stage sits in front of the arm's lower curve, above the
  substage assembly, and translates vertically along the arm's face (rack-and-pinion in real
  microscopes; represented here as a Y-axis translation on the stage node).
- `<stageClipLeft/Right, attached-to, stage>` — overlap contact, spring tension against the top
  face of the stage near the aperture.
- `<illuminator|mirror, attached-to, arm-base-junction>` — below the stage, aimed up through the
  stage aperture.
- `<illuminatorSwitch, attached-to, illuminator>` — embedded in the side of the illuminator housing.
- `<arm, attached-to, base>` — the arm's lower foot is bolted/socketed into the base's rear-top
  face (visible pivot/bolt in ref3).

## Layer 5 — Materials & surface (PBR)
- Body (arm, base, body tube): painted metal, low-to-mid roughness, dielectric (metalness ~0.1),
  off-white/cream albedo — matches all three references' body colour.
- Eyepiece tube + nosepiece: matte black paint, dielectric, higher roughness (no visible specular
  highlight in ref1/ref2 on these parts) — consistent with #1A1A1A / roughness 0.7.
- Focus knobs: dark grey/near-black, moderate roughness with a slight metalness bump versus the
  matte black parts (ref1/ref3 both show a faint specular ring on the knob face, suggesting
  metalness ~0.2 rather than 0).
- Objective barrels: chrome/polished metal, low roughness, high metalness (ref2's barrels show a
  distinct bright specular streak, unlike anything else on the body) — matches #C0C0C0,
  roughness 0.2, metalness 0.9.
- Objective colour bands: painted rings, dielectric, mid roughness, no metallic fleck.
- Stage: flat matte black, high roughness — no specular highlight visible on the stage top in
  ref1 or ref2 despite the illuminator's LED being lit just below it.
- Stage clips: bright chrome, low roughness, high metalness — visibly brighter/more specular than
  the stage or arm in ref2.
- Objective glass ends: not directly resolvable at this image resolution in ref2 (occluded by
  the barrel's own knurled housing from this angle) — treated as inferred/lower-confidence,
  represented as a small transparent dark disc at the tip per convention for this instrument
  class rather than directly observed pixel evidence.

## Layer 6 — Color & finish
- Body: cream/off-white (#F0EDE8-adjacent), satin finish, single flat tone, no gradient.
- Eyepiece/nosepiece: near-black, matte finish, single flat tone.
- Focus knobs: dark grey-black, satin-to-semi-gloss finish (subtle highlight visible in ref1).
- Objectives: silver/chrome, gloss/metallic finish, with three ordered colour-band stops: red
  (x4, nearest the nosepiece), yellow/orange (x10, mid-length), blue (x40, longest barrel) —
  directly observed in ref2's close-up of the nosepiece.
- Stage: near-black, matte finish.
- Illuminator LED: small saturated blue point highlight in ref2 (light-emissive detail, not a
  surface-material claim).

## Layer 7 — Identity-defining features
- The three colour-coded objective bands (red/yellow/blue) are the single most identity-critical
  feature — a school-microscope viewer recognises the instrument first by that band pattern.
- The large-coarse/small-fine knob pair, stacked coaxially on the arm's right face, is the second
  most identity-critical feature (clearly distinguishes this class of microscope from a modern
  binocular lab scope, which usually has the knobs at the base).
- The distinctive white C-arm silhouette (ref1) is the primary silhouette identifier.
- The spring stage clips (ref2) are a secondary but still load-bearing identity feature (their
  absence would make the stage read as a generic platform rather than a microscope stage).
- No maker's-mark-level engraving is resolvable at these image resolutions; the "KRÜSS" branding
  visible on ref1's base is a real logo and is intentionally NOT reproduced (avoids depicting a
  specific real product's trademark/branding on a generic in-game asset) — the base is modelled
  unbranded.

## Layer 8 — Uncertainty & single-image limits
- **Back face of the arm**: not shown in any of the three references (all three are front/3-quarter
  views). Modelled as a mirrored continuation of the visible curve profile — flagged
  low-confidence/inferred.
- **Underside of the stage**: not shown in any reference (ref2 is the closest, a high-angle view
  onto the stage's top face, but still does not reveal the underside). The rack-and-pinion
  mechanism, height-adjustment linkage, and substage condenser mounting are inferred from generic
  student-microscope convention, not observed pixel evidence — flagged low-confidence/inferred.
- **Objective glass tip discs**: occluded at these resolutions/angles in all three references —
  inferred detail (see Layer 5).
- **Rear of the illuminator housing / wiring**: ref2 shows the front face and LED only; the
  housing's rear/underside and any cable routing are undetermined — not modelled as a visible
  identity feature, kept minimal (a plain cylindrical housing) rather than invented in detail.
- ref3's arm curvature and knob geometry are used as the primary evidence for coarse/fine knob
  shape and arm profile since ref1's white background photo is the sharpest for silhouette but
  slightly foreshortened at the knob cluster; ref3's more front-on angle disambiguates knob radius
  and the arm's exact curve inflection point. Confidence: 0.75 for the arm curve's exact radius
  (extrapolated across two different physical microscope models, both plausible for the same
  general class, not the same physical unit).
- Mirror geometry (ref3 only) is inferred to be replicated on the LED variant as a non-functional
  spare/socket per the task's explicit request ("include this as a socket even if modelling the
  LED version primarily") — confidence 0.6 that the concave dish proportions transfer exactly to
  the illuminator-equipped body, since no reference shows both features on the same physical unit.
