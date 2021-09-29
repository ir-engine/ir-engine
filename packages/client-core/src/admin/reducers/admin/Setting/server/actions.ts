import { SETTING_SERVER_DISPLAY, SETTING_SERVER_UPDATE } from '../../../actions'

export interface ServerRetrieveResponse {
  type: string
  serverInfo: any
}

export interface ServerPatchedAction {
  type: string
  serverInfo: any
}

export const fetchedSeverInfo = (serverInfo: any): ServerRetrieveResponse => {
  return {
    type: SETTING_SERVER_DISPLAY,
    serverInfo: serverInfo
  }
}
