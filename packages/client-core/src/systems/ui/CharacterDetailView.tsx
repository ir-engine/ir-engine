import React from 'react'
import styled from 'styled-components'
import { createState } from '@hookstate/core'
import { useUserState } from '../../user/store/UserState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

export function createCharacterDetailView(id: string) {
  return createXRUI(CharacterDetailView, createCharacterDetailState(id))
}

function createCharacterDetailState(id: string) {
  return createState({
    id
  })
}

type CharacterDetailState = ReturnType<typeof createCharacterDetailState>

const Panel = styled.div`
  font-size: 60px;
  background-color: #000000dd;
  color: white;
  font-family: 'Roboto', sans-serif;
  border: 10px solid white;
  border-radius: 50px;
  padding: 20px;
  margin: 60px;
  filter: drop-shadow(0 0 30px #fff2);
`

const CharacterDetailView = () => {
  const detailState = useXRUIState() as CharacterDetailState
  const userState = useUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
  return user ? <Panel>{user.name.value}</Panel> : <div></div>
}
