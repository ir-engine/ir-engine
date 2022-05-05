import { useEffect } from 'react'

export const useFetchAdminParty = (user, adminPartyState, PartyService, search, page, sortField, fieldOrder) => {
  useEffect(() => {
    PartyService.fetchAdminParty(search, page, sortField, fieldOrder)
  }, [user?.id?.value, adminPartyState.updateNeeded.value, search])
}
