import React from 'react'
import { State } from '@hookstate/core'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { XRUIComponent } from '../components/XRUIComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { XRUIStateContext } from '../XRUIStateContext'
import { Engine } from '../../ecs/classes/Engine'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'

let depsLoaded: Promise<[typeof import('ethereal'), typeof import('react-dom')]>

async function createUIRootLayer<S extends State<any>>(
  UI: React.FC,
  state: S,
  options: import('ethereal').WebLayer3DOptions
) {
  const [Ethereal, ReactDOM] = await (depsLoaded = depsLoaded || Promise.all([import('ethereal'), import('react-dom')]))

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'

  ReactDOM.render(
    //@ts-ignore
    <XRUIStateContext.Provider value={state}>
      <UI />
    </XRUIStateContext.Provider>,
    containerElement
  )

  options.autoRefresh = options.autoRefresh ?? true
  return new Ethereal.WebLayer3D(containerElement, options)
}

export function createXRUI<S extends State<any>>(
  UIFunc: React.FC,
  state: S,
  options: import('ethereal').WebLayer3DOptions = {}
): XRUI<S> {
  const entity = createEntity()

  createUIRootLayer(UIFunc, state, options).then((uiRoot) => {
    // Make sure entity still exists, since we are adding these components asynchronously,
    // and bad things might happen if we add these components after entity has been removed
    // TODO: revise this pattern after refactor
    if (!Engine.currentWorld.entityQuery().includes(entity)) return
    addComponent(entity, Object3DComponent, { value: uiRoot })
    setObjectLayers(uiRoot, ObjectLayers.Render, ObjectLayers.UI)
    addComponent(entity, XRUIComponent, { layer: uiRoot })
  })
  return { entity, state }
}

export interface XRUI<S> {
  entity: Entity
  state: S
}
