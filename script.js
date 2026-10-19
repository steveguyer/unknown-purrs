// Count ticks
let tick = 0;

// Random line cutoff values for each line, calculated once and set
let cutoffs = [];

// The track loaded on startup
let sound;

const THEME_STORAGE_KEY = "unknown-pleasures-theme";
let themeName = "dark";
let themeToggleButton;

// Store the set of frequencies for each section (always real FFT frames, never bare 0)
function emptySpectrum() {
  let frame = [];
  for (let b = 0; b < SAMPLE_BINS; ++b) {
    frame.push(0);
  }
  return frame;
}

let points = [];
for (let i = 0; i < SLICE_SIZE; ++i) {
  points.push(emptySpectrum());
}

function preload() {
  sound = loadSound("sounds/peeves-purring.wav");
}

// Return y for a Gaussian distribution on x, with given mean and variance
function gaussian(x, mu, sigma) {
  let a = 1 / (sigma * Math.sqrt(2 * PI));
  let power_term = -0.5 * Math.pow(((x - mu) / sigma), 2);

  let y = a * Math.exp(power_term);
  return y;
}

// Transforms a given set of amplitude-time slices into the Unkown Pleasures shape
function transformWithWeights(amps, cutoff) {
  for (let i = 0; i < amps.length; ++i) {
    // Our input x range is the width of the visualization, something like -4 to +4
    // This can be tweaked to see where the central peaks will rise
    // The variance can be tweaked to control the extent and sharpness of the rise
    let x = map(i, 0, amps.length, -GAUSSIAN_SLICE_LENGTH, GAUSSIAN_SLICE_LENGTH);
    let gaussian_adjustment = gaussian(x, 0, GAUSSIAN_STD_DEVIATION);
    
    // We cut the top of the Gaussian curve off at the given cutoff value
    if (gaussian_adjustment > cutoff) {
      gaussian_adjustment = cutoff;
    }

    // Multiply our value by the gaussian weight, squashed to [0, 1]
    let val = amps[i];
    val *= map(gaussian_adjustment, 0, cutoff, 0.05, 0.5);

    amps[i] = val;
  }

  return amps;
}

function applyTheme(name) {
  themeName = THEMES[name] ? name : "dark";
  document.documentElement.setAttribute("data-theme", themeName);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  } catch (e) {
    // Ignore storage failures (private mode, etc.)
  }
  if (themeToggleButton) {
    themeToggleButton.html(themeName === "dark" ? "light mode" : "dark mode");
  }
}

function toggleTheme() {
  applyTheme(themeName === "dark" ? "light" : "dark");
}

function setup() {
  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  } catch (e) {
    savedTheme = "dark";
  }

  themeToggleButton = createButton("light mode");
  themeToggleButton.parent("buttons-container");
  themeToggleButton.id("theme-toggle");
  themeToggleButton.mousePressed(toggleTheme);
  applyTheme(savedTheme);

  // Canvas — page click also toggles play/pause (see below)
  var cnv = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  cnv.parent("canvas-container");
  document.getElementById("main-content-container").style.display = "block";
  fft = new p5.FFT();
  fft.setInput(sound);
  sound.loop();

  // Click anywhere on the page to pause/resume (skip controls/links)
  document.addEventListener("click", (event) => {
    if (event.target.closest("button, a, input, label, select, textarea, #buttons-container")) {
      return;
    }
    togglePlay();
  });
}

function draw() {
  
  tick++;

  // Only advance the waveform while audio is playing so pause freezes the stack
  if (sound && sound.isPlaying()) {
    var spectrum = fft.analyze(SAMPLE_BINS);
    points.push(spectrum);
    if (points.length > SLICE_SIZE) {
      points.shift();
    }
  }

  const theme = THEMES[themeName] || THEMES.dark;
  background(theme.background[0], theme.background[1], theme.background[2]);

  // Title sits above the wave stack
  noStroke();
  fill(theme.title[0], theme.title[1], theme.title[2]);
  textFont('Arial');
  textSize(26);
  textAlign(CENTER, BASELINE);
  text("PEEVES", CANVAS_WIDTH / 2, 115);

  // Blaze orange stroke; fill matches canvas so front waves hide ones behind
  stroke(theme.waveStroke[0], theme.waveStroke[1], theme.waveStroke[2]);
  fill(theme.canvasFill[0], theme.canvasFill[1], theme.canvasFill[2]);
  
  // Generate each wave..
  for (var j = 0; j < WAVE_COUNT; ++j) {

    // Spread low-frequency bins across the full top-to-bottom stack
    let current_bin = Math.floor(map(j, 0, WAVE_COUNT - 1, LF_BIN_START, LF_BIN_END));

    // Generate a random peak cutoff for each wave
    if (!cutoffs[j]) {
      let random_deviation = GAUSSIAN_CUTOFF_BASE * (Math.random() * 2 - 1)  * GAUSSIAN_CUTOFF_RANDOM_STRENGTH;
      cutoffs[j] = GAUSSIAN_CUTOFF_BASE + random_deviation;
    }

    // Get time slices for just the current bin, across all time slices
    let current_wave_amps = [];
    for (var i = SLICE_SIZE - 1; i >= 0 ; --i) {
      let frame = points[i];
      let raw = frame && frame[current_bin] != null ? frame[current_bin] : 0;
      let val = raw - AMPLITUDE_THRESHOLD;
      val = val < 0 ? 0 : val; // No negs
      val *= LF_AMPLITUDE_MULT;
      current_wave_amps.push(val);
    }
 
    // Transform each slice into the Unknown Pleasures shape
    current_wave_amps = transformWithWeights(current_wave_amps, cutoffs[j]);

    // Base Y value for the current wave
    const sep = SEPARATION * j;

    beginShape();
    for (var i = 0; i < SLICE_SIZE; ++i) {
      var x = map(i, 0, SLICE_SIZE, START_X, END_X);
      var h = map(current_wave_amps[i], 0, 255, START_Y + MAX_WAVE_HEIGHT + sep, START_Y + sep);
      curveVertex(x, h);
    }
    endShape();
  }

  // Caption sits under the wave stack
  noStroke();
  fill(theme.title[0], theme.title[1], theme.title[2]);
  textFont('Arial');
  textSize(18);
  textAlign(CENTER, TOP);
  const stackBottom = START_Y + MAX_WAVE_HEIGHT + SEPARATION * (WAVE_COUNT - 1);
  text("UNKNOWN PURRS", CANVAS_WIDTH / 2, stackBottom + 18);
}

function togglePlay() {
  if (sound.isPlaying()) {
    sound.pause();
  } else {
    sound.loop();
  }
}
