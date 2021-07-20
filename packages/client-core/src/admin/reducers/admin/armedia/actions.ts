import { ADMIN_FETCH_AR_MEDIA } from '../../actions'

export interface ArmediaRetrievedActions {
  type: string
  data: Array<string | any>
}

export const adminArmediaRetrieved = (data: Array<string | any>): ArmediaRetrievedActions => {
  return {
    type: ADMIN_FETCH_AR_MEDIA,
    data: data
  }
}
