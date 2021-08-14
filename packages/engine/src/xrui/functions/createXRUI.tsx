import React from 'react'
import { State } from '@hookstate/core'
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions'
import { UIRootComponent } from '../components/UIRootComponent'
import { UIComponent } from '../components/UIComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { XRUIStateContext } from '../XRUIStateContext'
import { World } from '../../ecs/classes/World'

let depsLoaded: Promise<[typeof import('ethereal'), typeof import('react-dom')]>

async function createUIRootLayer<S extends State<any>>(UI: React.FC, state: S, theme: any) {
  const [Ethereal, ReactDOM] = await (depsLoaded = depsLoaded || Promise.all([import('ethereal'), import('react-dom')]))

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'

  ReactDOM.render(
    <XRUIStateContext.Provider value={state}>
      <UI />
    </XRUIStateContext.Provider>,
    containerElement
  )

  const uiRoot = new Ethereal.WebLayer3D(containerElement, {
    onLayerCreate: (layer) => {
      const layerEntity = createEntity()
      addComponent(layerEntity, UIComponent, { layer })
    }
  })

  return uiRoot
}

export function createXRUI<S extends State<any>>(UIFunc: React.FC, state: S, theme = {}): XRUI<S> {
  const entity = createEntity()
  createUIRootLayer(UIFunc, state, theme).then((uiRoot) => {
    // Make sure entity still exists, since we are adding these components asynchronously,
    // and bad things might happen if we add these components after entity has been removed
    // TODO: revise this pattern after refactor
    if (World.defaultWorld.entities.indexOf(entity) === -1) return
    addComponent(entity, Object3DComponent, { value: uiRoot })
    addComponent(entity, UIRootComponent, { layer: uiRoot })
  })
  return { entity, state }
}

export interface XRUI<S> {
  entity: Entity
  state: S
}
