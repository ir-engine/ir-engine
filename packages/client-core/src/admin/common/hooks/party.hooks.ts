import { useEffect } from 'react'

export const useFetchAdminParty = (user, adminPartyState, PartyService, search, page, sortField, orderby) => {
  useEffect(() => {
    //if (user?.id?.value && adminParty.updateNeeded.value) {
    //PartyService.fetchAdminParty('increment', null)
    //}
    PartyService.fetchAdminParty(search, page, sortField, orderby)
  }, [user?.id?.value, adminPartyState.updateNeeded.value, search])
}
