import { isClient } from './isClient'

export function isBot(window: Window) {
  if (!isClient) return false

  const query = window.location.search
  const params = new URLSearchParams(query)
  const isBot = params.get('bot')
  return isBot === null ? false : true
}
