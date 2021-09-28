import { CHARGEBEE_SETTING_DISPLAY } from '../../../actions'

export interface ChargebeeRetriveResponse {
  type: string
  chargebee: any[]
}

export const fetchedChargebee = (chargebee: any): ChargebeeRetriveResponse => {
  return {
    type: CHARGEBEE_SETTING_DISPLAY,
    chargebee: chargebee
  }
}
