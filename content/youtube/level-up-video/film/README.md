# Level-up video: animated scenes

Source for the VideoHub film "Uni and a career aren't enough anymore" (Muslimah in Business).
The working copy lives in the VideoHub workspace at `films/level-up`. This folder is a backup of its code.

- `timing.js`: scene lengths and beat times. This is the file that changes when the voice recording arrives.
- `film.js`: the seven scenes, drawn on a 1920x1080 canvas.
- `fonts/`: Fraunces and DM Sans (SIL Open Font License, see the OFL files).

To restore: copy this folder to `<VideoHub workspace>/films/level-up`, run `DUR=300 node make-audio.js` for a
placeholder sound bed (or add the real `audio/mix.wav`), then open it in VideoHub.
