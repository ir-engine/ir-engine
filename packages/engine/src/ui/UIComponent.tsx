import { Component } from '../ecs/classes/Component';
import { Types } from '../ecs/types/Types';
import { addComponent, createEntity } from '../ecs/functions/EntityFunctions'
import { addObject3DComponent } from '../scene/behaviors/addObject3DComponent'

import { WebLayer3D, WebLayer3DContent } from 'ethereal'
import React from 'react'
import ReactDOM from 'react-dom'

export class UIComponent extends Component<UIComponent> {
  layer: WebLayer3DContent;
  static _schema = {
    layer: { type: Types.Ref, default: null },
  }
}

export function createUI(UI:React.FC) {
  const element = document.createElement('div')
  ReactDOM.render(<UI></UI>,element)
  const rootLayer = new WebLayer3D(element, {
      onLayerCreate: (layer) => {
          const layerEntity = createEntity()
          addComponent(layerEntity, UIComponent, {layer})
      }
  })
  const rootEntity = createEntity()
  addObject3DComponent(rootEntity, {obj3d:rootLayer})
  return rootEntity
}