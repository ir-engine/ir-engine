import { useEffect } from 'react'

export const useFetchAdminParty = (user, adminParty, adminPartyState, PartyService, search) => {
  useEffect(() => {
    if (user?.id?.value && adminParty.updateNeeded.value) {
      PartyService.fetchAdminParty('increment', null)
    }
    PartyService.fetchAdminParty('increment', search)
  }, [user?.id?.value, adminPartyState.updateNeeded.value, search])
}
