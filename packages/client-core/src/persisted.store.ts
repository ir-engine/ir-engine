import { Config } from './helper';

import { RESTORE } from '@xr3ngine/client-core/src/user/reducers/actions';

export function restoreState (): any {
  return {
    type: RESTORE
  };
}

export function getStoredState (key: string) {
  if (!window) {
    return undefined;
  }
  const rawState = localStorage.getItem(Config.publicRuntimeConfig.localStorageKey.localStorageKey);
  if (!rawState) {
    return undefined;
  }
  const state = JSON.parse(rawState);
  return state[key];
}

export function saveState (state: any) {
  localStorage.setItem(Config.publicRuntimeConfig.localStorageKey.localStorageKey, JSON.stringify(state));
}
