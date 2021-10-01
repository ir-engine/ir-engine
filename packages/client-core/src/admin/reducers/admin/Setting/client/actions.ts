import { CLIENT_SETTING_DISPLAY, CLIENT_SETTING_UPDATE } from '../../../actions'

export interface ClientRetrieveResponse {
  type: string
  client: any
}

export interface ClientPatchedAction {
  type: string
  client: any
}

export const fetchedClient = (client: any): ClientRetrieveResponse => {
  return {
    type: CLIENT_SETTING_DISPLAY,
    client: client
  }
}
