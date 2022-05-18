import { isClient } from './isClient'

export function ensureIsBrowser() {
  if (!isClient) throw new Error('Execution in browser environment is required.')
}
