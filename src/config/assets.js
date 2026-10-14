export const ASSETS = {
  characters: {
    pip: {
      idle: '/assets/characters/pip_idle.png',
      speaking: '/assets/characters/pip_speaking.png',
      wiggle: '/assets/characters/pip_wiggle.png',
      react: '/assets/characters/pip_react.png',
      celebrate: '/assets/characters/pip_celebrate.png',
    },
    lili: {
      idle: '/assets/characters/lili_idle.png',
      speaking: '/assets/characters/lili_speaking.png',
      wiggle: '/assets/characters/lili_wiggle.png',
      react: '/assets/characters/lili_react.png',
      celebrate: '/assets/characters/lili_celebrate.png',
    },
    madu: {
      idle: '/assets/characters/madu_idle.png',
      speaking: '/assets/characters/madu_speaking.png',
      wiggle: '/assets/characters/madu_wiggle.png',
      react: '/assets/characters/madu_react.png',
      celebrate: '/assets/characters/madu_celebrate.png',
    },
    lumi: {
      idle: '/assets/characters/lumi_idle.png',
      speaking: '/assets/characters/lumi_speaking.png',
      wiggle: '/assets/characters/lumi_wiggle.png',
      react: '/assets/characters/lumi_react.png',
      celebrate: '/assets/characters/lumi_celebrate.png',
    },
  },
  // Hand-drawn illustration slots. None of these files need to exist yet:
  // HanddrawnIcon shows a dashed amber placeholder until they do.
  illustrations: {
    nav_mission: '/assets/illustrations/nav_mission.png',
    nav_language: '/assets/illustrations/nav_language.png',
    botanical_1: '/assets/illustrations/botanical_1.png',
    botanical_2: '/assets/illustrations/botanical_2.png',
    botanical_3: '/assets/illustrations/botanical_3.png',
    botanical_4: '/assets/illustrations/botanical_4.png',
    botanical_5: '/assets/illustrations/botanical_5.png',
    float_seedling: '/assets/illustrations/float_seedling.png',
    float_tree: '/assets/illustrations/float_tree.png',
    float_blossom: '/assets/illustrations/float_blossom.png',
    sticker_game: '/assets/illustrations/sticker_game.png',
    sticker_world: '/assets/illustrations/sticker_world.png',
    seedling: '/assets/illustrations/seedling.png',
    flower_small: '/assets/illustrations/flower_small.png',
  },
  ui: {
    logo: '/assets/ui/logo_title.svg',
    // sharp raster title cut out of the design reference (the SVG is an auto-trace)
    logoTitleHq: '/assets/ui/logo_title_hq.png',
    logoMark: '/assets/ui/logo_mark_placeholder.svg',
    sunIcon: '/assets/ui/icon_sun.svg',
    labbudiIconButton: '/assets/ui/labbudi_icon_button.png',
    cloudMenu: '/assets/ui/cloud_menu.png',
    bgHome: '/assets/ui/bg_home.png',
    // The painted path every practical's roadmap is drawn on. Replace public/assets/ui/bg_roadmap.png with your
    // own image (same 1366x768 shape) and it is used straight away. The nodes sit on a path traced from the
    // current artwork (src/config/roadmapLayout.js), so a different path needs that file updated to match.
    bgRoadmap: '/assets/ui/bg_roadmap.png',
    // bg_home.png with the flower heads, butterflies and ladybugs removed (they are animated sprites on top)
    // Optional: a picture of a Universal Indicator colour chart for the results step (e.g. one you have
    // permission to use). Put the file in public/assets/ui/ and set the path here; null draws the built-in chart.
    universalIndicatorChart: null,
    bgHomeStill: '/assets/ui/bg_home_still.png',
    bgYearSelect: '/assets/ui/bg_year_select.png',
    // bg_year_select.png with the sun and the two painted flower clusters removed (they are animated sprites)
    bgYearSelectStill: '/assets/ui/bg_year_select_still.png',
    bgOverworldY7: '/assets/ui/bg_overworld_y7.png',
    pipHome: '/assets/ui/pip_home.png',
    flowerY7: '/assets/ui/flower_y7.png',
    flowerY8: '/assets/ui/flower_y8.png',
    flowerY9: '/assets/ui/flower_y9.png',
    beeP1: '/assets/ui/bee_p1.png',
    beeP2: '/assets/ui/bee_p2.png',
    beeP3: '/assets/ui/bee_p3.png',
    beeP4: '/assets/ui/bee_p4.png',
    beeP5: '/assets/ui/bee_p5.png',
    notebookCover: '/assets/ui/notebook_cover.png',
    tabs: [
      '/assets/ui/tab_1.svg',
      '/assets/ui/tab_2.svg',
      '/assets/ui/tab_3.svg',
      '/assets/ui/tab_4.svg',
      '/assets/ui/tab_5.svg',
    ],
    cardY7: '/assets/ui/card_y7.png',
    cardY8: '/assets/ui/card_y8.png',
    cardY9: '/assets/ui/card_y9.png',
    btnStart: '/assets/ui/btn_start.svg',
  },
  misc: {
    speechBubble: '/assets/misc/speech_bubble.svg',
    stampComplete: '/assets/misc/stamp_complete.svg',
    stampCheckpoint: '/assets/misc/stamp_checkpoint.svg',
    washiTape: [
      '/assets/misc/washi_tape_1.svg',
      '/assets/misc/washi_tape_2.svg',
      '/assets/misc/washi_tape_3.svg',
      '/assets/misc/washi_tape_4.svg',
    ],
    doodleStar: [
      '/assets/misc/doodle_star_1.svg',
      '/assets/misc/doodle_star_2.svg',
      '/assets/misc/doodle_star_3.svg',
    ],
  },
};
