import { createState } from '@speigg/hookstate'
import { useState } from '@speigg/hookstate'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { useUserState } from '../../../user/services/UserService'
import styleString from './index.scss'

export function createAvatarDetailView(id: string) {
  return createXRUI(
    AvatarDetailView,
    createState({
      id
    })
  )
}

interface AvatarDetailState {
  id: string
}

const AvatarDetailView = () => {
  const { t } = useTranslation()
  const detailState = useXRUIState<AvatarDetailState>()
  const userState = useUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
  const worldState = useEngineState()
  const usersTyping = useState(worldState.usersTyping[detailState.id.value]).value

  return (
    <>
      <style>{styleString}</style>
      {user && (
        <div className="avatarName">
          {user.name.value}
          {usersTyping && <h6 className="typingIndicator">{t('common:typing')}</h6>}
        </div>
      )}
    </>
  )
}
