import { PARTY_ADMIN_CREATED, PARTY_ADMIN_DISPLAYED } from '../../actions'

export interface partyAdminCreatedResponse {
  type: string
  data: any
}
export const partyAdminCreated = (data: any): partyAdminCreatedResponse => {
  return {
    type: PARTY_ADMIN_CREATED,
    data: data
  }
}

export const partyRetrievedAction = (data: any): partyAdminCreatedResponse => {
  return {
    type: PARTY_ADMIN_DISPLAYED,
    data: data
  }
}
