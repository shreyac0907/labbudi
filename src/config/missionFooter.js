// Settings for the grass footer on the Our Mission page. Edit the values here;
// the footer and the page spacing both follow (src/components/MissionFooter.jsx).
//
// The footer is fixed to the bottom of the screen and the text scrolls behind
// it. It is either the Canva design (an embed) or a picture of your own.

export const MISSION_FOOTER = {
  // 'canva': show the Canva design below (edit it in Canva and the page updates
  //          by itself).
  // 'image': show `imageUrl` instead: any PNG/JPG/SVG, anchored to the bottom
  //          edge and filling the footer's width. Put your file in
  //          public/assets/ui/ and point imageUrl at it.
  source: 'canva',
  canvaUrl: 'https://www.canva.com/design/DAHXXZY95Nw/Md9Hcu31xNt3AfQuQsen0w/view?embed',
  imageUrl: '/assets/ui/mission_footer.png',

  // How tall the footer is: widthFactor x the screen width, but never taller than
  // maxHeightVh % of the screen height. Bigger numbers = more grass, less text.
  widthFactor: 0.3,
  maxHeightVh: 38,

  // Canva only: the embed has its own control strip (zoom / menu / logo /
  // fullscreen) along its bottom edge. This many px of the embed are pushed
  // below the screen edge to hide it. Set to 0 to show it.
  hideCanvaBarPx: 40,

  // Height in px of the white fade above the footer, where text dissolves before
  // it reaches the flowers. 0 = text is cut off by a hard edge instead.
  fadeHeightPx: 72,

  // Gap in px between the last paragraph and the footer when scrolled to the end.
  endGapPx: 24,

  // Footer background behind the artwork (visible if the image is shorter).
  background: '#ffffff',
};

// CSS length for the footer's height, shared by the footer and the page padding.
export const MISSION_FOOTER_HEIGHT = `min(${MISSION_FOOTER.widthFactor * 100}vw, ${MISSION_FOOTER.maxHeightVh}vh)`;
