
export const MODEL_VERSION = "2025.09";
export const HYSTERESIS_THRESHOLD = 0.015;
export const TWAP_WINDOW_DAYS = 3;
export const DISPLAY_BLEND = { twap: 0.7, today: 0.3 };
export const CATEGORIES = [
  { id: "watch", label: "Orologi" },
  { id: "art", label: "Arte" },
  { id: "sneakers", label: "Sneakers" },
  { id: "wine", label: "Vini" },
  { id: "auto", label: "Auto" },
  { id: "gems", label: "Pietre preziose" },
];
export const CATEGORY_PARAMS = {
  watch: { baseVol: 0.005, alpha: 0.002 },
  art: { baseVol: 0.004, alpha: 0.0015 },
  sneakers: { baseVol: 0.007, alpha: 0.0025 },
  wine: { baseVol: 0.003, alpha: 0.001 },
  auto: { baseVol: 0.006, alpha: 0.002 },
  gems: { baseVol: 0.0035, alpha: 0.0012 },
};
export const LS_KEY = "stima_app_state_v1";
