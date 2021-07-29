import React from 'react'
import styled from 'styled-components'
import { createState, useState } from '@hookstate/core'
import { createUI } from '@xrengine/engine/src/xrui/functions/createUI'
import { useUserState } from '../../user/store/UserState'

export function createCharacterDetailView(id: string) {
  return createUI(CharacterDetailView, createCharacterDetailState(id))
}

function createCharacterDetailState(id: string) {
  return createState({
    id
  })
}

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

const CharacterDetailView = (props: { state: ReturnType<typeof createCharacterDetailState> }) => {
  const detailState = useState(props.state)
  const userState = useUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
  return user ? <Panel>{user.name.value}</Panel> : <div></div>
}
