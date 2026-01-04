const PREFS_KEY = 'pokedleplus:prefs';

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { confetti: true };
    return JSON.parse(raw);
  } catch {
    return { confetti: true };
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export function getConfettiEnabled() {
  return loadPrefs().confetti !== false;
}

export function setConfettiEnabled(enabled) {
  const prefs = loadPrefs();
  prefs.confetti = enabled;
  savePrefs(prefs);
}