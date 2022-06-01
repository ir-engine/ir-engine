import { createState } from '@speigg/hookstate'
import { useState } from '@speigg/hookstate'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { useUserState } from '../../user/services/UserService'

const styles = {
  avatarName: {
    fontSize: '60px',
    backgroundColor: '#000000dd',
    color: 'white',
    fontFamily: "'Roboto', sans-serif",
    border: '10px solid white',
    borderRadius: '50px',
    padding: '20px',
    margin: '60px',
    boxShadow: '#fff2 0 0 30px',
    width: '400px',
    textAlign: 'center'
  }
}

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

  return user ? (
    <div style={styles.avatarName as {}}>
      {user.name.value}
      {usersTyping && <h6 style={{ margin: 0, padding: 0 }}>{t('common:typing')}</h6>}
    </div>
  ) : (
    <div></div>
  )
}
