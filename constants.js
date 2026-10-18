const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

// Fraction of screen width on which lines are drawn
const WIDTH_FRACTION = 0.40;

// Height from top in pixels to start drawing waves
const START_Y = 110;

// Calculate wave start and end pixel X values based on the above
const WAVE_WIDTH = WIDTH_FRACTION * CANVAS_WIDTH;
const START_X = (CANVAS_WIDTH / 2) - (WAVE_WIDTH / 2);
const END_X = START_X + WAVE_WIDTH;

// Number of frequency bins for the FFT 
const SAMPLE_BINS = 1024;

// Number of ticks of amplitude on the screen at once
// This value higher => curve complexity higher, latency of visualization higher, performance lower 
const SLICE_SIZE = 65;

// Total stacked waves drawn top-to-bottom
const WAVE_COUNT = 80;

// FFT bin range spread across the full stack (low frequencies only).
// Raise LF_BIN_END to include a bit more mid-bass; lower it for deeper bass only.
const LF_BIN_START = 0;
const LF_BIN_END = 60;

// Wave height in pixels
const MAX_WAVE_HEIGHT = 20;

// Gap between each wave in pixels
const SEPARATION = 3;

// Controls the "zoom" of the central peaks.
// Increase this to decrease the size of the middle bump
const GAUSSIAN_SLICE_LENGTH = 22;

// Standard Deviation value of the Gaussian curve used to generate the peaks
const GAUSSIAN_STD_DEVIATION = 3;

// Value at which the curve no longer behaves like a Gaussian, and lays flat
// This value will be added with random noise to get mountains of different sizes
const GAUSSIAN_CUTOFF_BASE = 0.01;

// Each curve has a random value added to cutoff to make the visualization nicer
// This controls how powerful that randomness is
const GAUSSIAN_CUTOFF_RANDOM_STRENGTH = 0.7;

// Amplitude multiplier for bass waves (same across the stack since all bins are low-freq)
const LF_AMPLITUDE_MULT = 2.2;

// Amplitude lower than which a frequency could be considered negligible
// A higher value means you see less activity but only the louder frequencies
const AMPLITUDE_THRESHOLD = 40;
