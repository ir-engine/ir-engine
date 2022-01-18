import React from 'react'
import { createState } from '@hookstate/core'
import { useUserState } from '../../user/services/UserService'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

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
  const detailState = useXRUIState() as CharacterDetailState
  const userState = useUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
  return user ? <div style={styles.avatarName as {}}>{user.name.value}</div> : <div></div>
}
