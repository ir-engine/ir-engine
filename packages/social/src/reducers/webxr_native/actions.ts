/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

export const TOGGLE_WEBXRNATIVE = 'TOGGLE_WEBXRNATIVE'
export const SET_WEBXRNATIVE = 'SET_WEBXRNATIVE'

export interface ChangeWebXrNative {
  type: string
}

export function setWebXrNative(): ChangeWebXrNative {
  return {
    type: SET_WEBXRNATIVE
  }
}
export function tougleWebXrNative(): ChangeWebXrNative {
  return {
    type: TOGGLE_WEBXRNATIVE
  }
}
