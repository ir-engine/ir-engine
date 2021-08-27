import { EMAIL_SETTING_DISPLAY, EMAIL_SETTING_UPDATE } from '../../../actions'

export interface EmailRetrieveResponse {
  type: string
  email: any
}

export interface EmailPatchedAction {
  type: string
  email: any
}

export const fetchedEmail = (email: any): EmailRetrieveResponse => {
  return {
    type: EMAIL_SETTING_DISPLAY,
    email: email
  }
}
