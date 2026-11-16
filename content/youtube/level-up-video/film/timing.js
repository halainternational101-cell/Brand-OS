// Timing for "Uni and a career aren't enough anymore" (Muslimah in Business).
// These are guesses from the script at a relaxed speaking pace. When the voice recording arrives, only this file
// changes: each scene's length, and each beat (seconds from the start of its scene) is moved to the matching words.
window.FILM_TIMING = {
  name: 'Hodan',            // shown as "I'm ..." in scene 2
  scenes: [
    { key: 'hook',   name: '1 Hook',                 dur: 20 },
    { key: 'me',     name: '2 Who I am',             dur: 30 },
    { key: 'old',    name: '3 The old plan',         dur: 50 },
    { key: 'ai',     name: '4 Learn AI',             dur: 60 },
    { key: 'biz',    name: '5 Build a business',     dur: 60 },
    { key: 'kids',   name: '6 Raise them your way',  dur: 40 },
    { key: 'cta',    name: '7 Your first step',      dur: 40 },
  ],
  beats: {
    hook: { told: 0.4, uni: 2.6, degree: 3.7, job: 4.8, did: 6.2, why: 8.4, stay: 13.5, out: 19.4 },
    me:   { salaam: 0.3, logo: 1.4, name: 4.5, timeline: 8, chips: 13.5, payslip: 17, travel: 20.5, owner: 23.5, open: 26.5 },
    old:  { edu: 0.3, right: 2.6, gift: 5.5, moved: 9.5, jobs: 12, prices: 18.5, juggle: 25, finish: 33.5, behind: 41, daughters: 46 },
    ai:   { title: 0, words: 4, tool: 10, advantage: 15, week: 19, clock: 27, course: 34, prompts: 37.5, ten: 54 },
    biz:  { title: 0, quit: 4, small: 8, control: 17.5, startwith: 26, ask: 34, days: 46, choices: 51.5 },
    kids: { title: 0, doors: 5, third: 11, list: 19.5, stays: 33.5 },
    cta:  { where: 0, bismillah: 2, guide: 4.5, calendar: 11, comments: 19, subscribe: 24, change: 30.5, end: 35 },
  },
};
