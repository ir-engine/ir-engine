import { createState } from '@speigg/hookstate'
import React from 'react'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { useUserState } from '../../user/services/UserService'

const styles = {
  container: {}
}

export function createMainMenuButtonsView() {
  return createXRUI(MainMenuButtons, createMainMenuButtonsState())
}

function createMainMenuButtonsState() {
  return createState({
    id: '' as UserId
  })
}

type MainMenuButtonsState = ReturnType<typeof createMainMenuButtonsState>

const MainMenuButtons = () => {
  const detailState = useXRUIState() as MainMenuButtonsState
  const userState = useUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)

  return user?.id.value ? <div style={styles.container as {}}></div> : <div></div>
}
