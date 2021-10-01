import { ADMIN_AUTH_SETTING_FETCHED, ADMIN_AUTH_SETTING_PATCHED } from '../../../actions'

export interface AuthSettingFetchedAction {
  type: string
  list: any[]
}

export interface AuthSettingPatchedAction {
  type: string
}

export function authSettingRetrieved(data: any): AuthSettingFetchedAction {
  return {
    type: ADMIN_AUTH_SETTING_FETCHED,
    list: data
  }
}

export function authSettingPatched(data: any): AuthSettingPatchedAction {
  return {
    type: ADMIN_AUTH_SETTING_PATCHED
  }
}
