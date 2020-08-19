import { hasWindow } from "./hasWindow";
/**
 * performance.now() "polyfill"
 */

export const now = hasWindow && typeof window.performance !== 'undefined' ? performance.now.bind(performance) : Date.now.bind(Date);
