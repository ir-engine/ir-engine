import { createState } from '@speigg/hookstate'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { addActionReceptor, removeActionReceptor } from '@xrengine/hyperflux'

import Button from '@mui/material/Button'

import { PartyService, PartyServiceReceptor } from '../../../social/services/PartyService'
import { getAvatarURLForUser } from '../../../user/components/UserMenu/util'
import { useAuthState } from '../../../user/services/AuthService'
import { UserService, useUserState } from '../../../user/services/UserService'
import styleString from './index.scss'

export function createAvatarContextMenuView() {
  return createXRUI(
    AvatarContextMenu,
    createState({
      id: '' as UserId
    })
  )
}

interface UserMenuState {
  id: UserId
}

const AvatarContextMenu = () => {
  const detailState = useXRUIState<UserMenuState>()

  const engineState = useEngineState()
  const userState = useUserState()

  const authState = useAuthState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
  const { t } = useTranslation()

  // TODO: move these to widget register
  PartyService.useAPIListeners()
  useEffect(() => {
    addActionReceptor(PartyServiceReceptor)
    return () => {
      removeActionReceptor(PartyServiceReceptor)
    }
  }, [])

  const blockUser = () => {
    if (authState.user?.id?.value !== null && user) {
      const selfId = authState.user.id?.value ?? ''
      const blockUserId = user.id?.value ?? ''
      UserService.blockUser(selfId, blockUserId)
    }
  }

  const addAsFriend = () => {
    if (authState.user?.id?.value !== null && user) {
      const selfId = authState.user.id?.value ?? ''
      const blockUserId = user.id?.value ?? ''
      UserService.requestFriend(selfId, blockUserId)
    }
  }

  const inviteToParty = () => {
    if (authState.user?.partyId?.value !== null && user) {
      const partyId = authState.user?.partyId?.value ?? ''
      const userId = user.id?.value ?? ''
      PartyService.inviteToParty(partyId, userId)
    }
  }

  useEffect(() => {
    if (engineState.avatarTappedId.value !== authState.user.id.value)
      detailState.id.set(engineState.avatarTappedId.value)
  }, [engineState.avatarTappedId.value])

  return (
    <>
      <style>{styleString}</style>
      {user?.id.value && (
        <div className="rootContainer">
          <img className="ownerImage" src={getAvatarURLForUser(user?.id?.value)} />
          <div className="buttonContainer">
            <section className="buttonSection">
              <Button className="button" onClick={inviteToParty}>
                {t('user:personMenu.inviteToParty')}
              </Button>
              <Button className="button" onClick={addAsFriend}>
                {t('user:personMenu.addAsFriend')}
              </Button>
              <Button
                className="button"
                onClick={() => {
                  console.log('Mute')
                }}
              >
                {t('user:personMenu.mute')}
              </Button>
              <Button className="buttonRed" onClick={blockUser}>
                {t('user:personMenu.block')}
              </Button>
            </section>
          </div>
        </div>
      )}
    </>
  )
}
