import { createInitialState, normalizeState } from "./state-normalizer.js";
import { validateState } from "./validation/state-validator.js";

export { createInitialState, normalizeState, validateState };

export function isValidState(state) {
  return validateState(state).valid;
}
