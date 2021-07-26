import React from 'react'
import styled from 'styled-components'
import { createState } from '@hookstate/core'
import { createUI } from '../../xrui/functions/createUI'

export function createCharacterDetailView() {
  return createUI(CharacterDetailView, createCharacterDetailState())
}

function createCharacterDetailState() {
  return createState({
    username: 'Name',
    theme: {
      main: 'purple'
    }
  })
}

const Panel = styled.div`
  background: #ffffff55;
  border-radius: 3px;
  border: 2px solid palevioletred;
  color: palevioletred;
  margin: 0.5em 1em;
  padding: 0.25em 1em;
`

const CharacterDetailView = (props: { state: ReturnType<typeof createCharacterDetailState> }) => {
  return <Panel>{props.state.username.get()}</Panel>
}
