import React from 'react'
import styled from 'styled-components'

import { Network } from '../../../../networking/classes/Network'
import { createXRUI } from '../../../../xrui/functions/createXRUI'
import { addComponent, getComponent } from '../../../../ecs/functions/EntityFunctions'
import { TransformChildComponent } from '../../../../transform/components/TransformChildComponent'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { Entity } from '../../../../ecs/classes/Entity'
import { Vector3 } from 'three'

export const Panel = styled.div`
  background: #ffffff55;
  border-radius: 3px;
  border: 2px solid palevioletred;
  /* color: () => {palette.info.main}; */
  margin: 0.5em 1em;
  padding: 0.25em 1em;
`

export const YourTurnPanel = () => {
  return <Panel>Your turn!</Panel>
}

export async function createYourTurnPanel(player: Entity) {
  if (player === Network.instance.localClientEntity) {
    const ui = createXRUI(YourTurnPanel, {})
    addComponent(ui.entity, TransformComponent)
    addComponent(ui.entity, TransformChildComponent, { parent: player, offsetPosition: new Vector3(0, 0, 1) })
  }
}
