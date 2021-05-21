/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { WebXrNativeShort } from '@xrengine/common/src/interfaces/WebXrNativeShort';

export const TOUGLE_WEBXRNATIVE = 'TOUGLE_WEBXRNATIVE';
export const SET_WEBXRNATIVE = 'SET_WEBXRNATIVE';


export interface ChangeWebXrNative{
  type: string;
}

export function setWebXrNative(): ChangeWebXrNative {
  return {
    type: SET_WEBXRNATIVE
  };
}
export function tougleWebXrNative(): ChangeWebXrNative {
  return {
    type: TOUGLE_WEBXRNATIVE
  };
}
