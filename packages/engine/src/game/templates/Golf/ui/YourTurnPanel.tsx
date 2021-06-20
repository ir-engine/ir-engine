
import React from 'react'
import styled from 'styled-components'

import { Network } from '../../../../networking/classes/Network'
import { getHand } from '../../../../xr/functions/WebXRFunctions'
import { createUI } from '../../../../ui/UIComponent'
import { addComponent } from '../../../../ecs/functions/EntityFunctions'
import { TransformChildComponent } from '../../../../transform/components/TransformChildComponent'
import { TransformComponent } from '../../../../transform/components/TransformComponent'

export const Panel = styled.div`
background: #FFFFFF55;
border-radius: 3px;
border: 2px solid palevioletred;
color: palevioletred;
margin: 0.5em 1em;
padding: 0.25em 1em;
`

export const YourTurnPanel = () => {
    return <Panel>Your turn!</Panel>
}

export function createYourTurnPanel() {
    const localClient = Network.instance.localClientEntity
    const hand = getHand(localClient)
    const uiEntity = createUI(YourTurnPanel)
    addComponent(uiEntity, TransformComponent)
    addComponent(uiEntity, TransformChildComponent, {parent:hand})
}