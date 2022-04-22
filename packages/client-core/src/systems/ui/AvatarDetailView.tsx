import { createState } from '@speigg/hookstate'
import { none } from '@speigg/hookstate'
import { useState } from '@speigg/hookstate'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import matches from 'ts-matches'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { UsersTypingState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { addActionReceptor, getState } from '@xrengine/hyperflux'

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
  return createXRUI(CharacterDetailView, createAvatarDetailState(id))
}

function createAvatarDetailState(id: string) {
  return createState({
    id
  })
}

type CharacterDetailState = ReturnType<typeof createAvatarDetailState>

const CharacterDetailView = () => {
  const { t } = useTranslation()
  const detailState = useXRUIState() as CharacterDetailState
  const userState = useUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
  const usersTyping = user
    ? useState(getState(Engine.currentWorld.store, UsersTypingState)[user.id.value]).value
    : undefined

  useEffect(() => {
    addActionReceptor(Engine.currentWorld.store, userTypingActionReceptor)
  }, [])

  function userTypingActionReceptor(action) {
    matches(action).when(NetworkWorldAction.userTyping.matches, ({ $from, typing }) => {
      getState(Engine.currentWorld.store, UsersTypingState)[$from].set(typing ? true : none)
    })
  }

  return user ? (
    <div style={styles.avatarName as {}}>
      {user.name.value}
      {usersTyping && <h6 style={{ margin: 0, padding: 0 }}>{t('common:typing')}</h6>}
    </div>
  ) : (
    <div></div>
  )
}
