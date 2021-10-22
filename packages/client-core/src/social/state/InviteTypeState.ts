import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { InviteTypeActionType } from './InviteTypeActions'
import { InviteType } from '@xrengine/common/src/interfaces/InviteType'
import { store } from '../../store'

const state = createState({
  inviteTypeData: {
    invitesType: [] as Array<InviteType>,
    skip: 0,
    limit: 5,
    total: 0
  }
})

store.receptors.push((action: InviteTypeActionType): any => {
  let newValues
  state.batch((s) => {
    switch (action.type) {
      case 'LOAD_INVITE_TYPE':
        newValues = action
        if (newValues.invitesType != null) {
          s.inviteTypeData.invitesType.merge([newValues.invitesType])
        }
        s.inviteTypeData.skip.set(newValues.skip)
        s.inviteTypeData.limit.set(newValues.limit)
        return s.inviteTypeData.total.set(newValues.total)
    }
  }, action.type)
})

export const accessInviteTypeState = () => state

export const useInviteTypeState = () => useState(state) as any as typeof state
