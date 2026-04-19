/**
 * Frontend game logic utilities
 *
 * IMPORTANT: Core game logic has been moved to shared/gameLogic.js
 * This file now just re-exports from the shared module to maintain
 * backwards compatibility with existing imports.
 *
 * The shared module is the single source of truth for compareGuess and fnv1a.
 */

// Import from shared ESM wrapper using Vite alias
export { fnv1a, compareGuess } from "@shared/gameLogic.mjs";
