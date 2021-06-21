

import React from 'react'

import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions'
import { addObject3DComponent } from '../../scene/behaviors/addObject3DComponent'
import { UIComponent } from '../components/UIComponent'

export async function createUI(UI:React.FC) {
    const [Ethereal, ReactDOM] = await Promise.all([
        import('ethereal'),
        import('react-dom')
    ])
    const element = document.createElement('div')
    ReactDOM.render(<UI></UI>,element)
    const ui = new Ethereal.WebLayer3D(element, {
        onLayerCreate: (layer) => {
            const layerEntity = createEntity()
            addComponent(layerEntity, UIComponent, {layer})
        }
    })
    const uiEntity = createEntity()
    addObject3DComponent(uiEntity, {obj3d:ui})
    return uiEntity
  }