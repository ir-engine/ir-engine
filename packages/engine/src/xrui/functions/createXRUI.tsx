import React from 'react'
import { createState, State } from '@hookstate/core'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { XRUIComponent } from '../components/XRUIComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { XRUIStateContext } from '../XRUIStateContext'
import { Engine } from '../../ecs/classes/Engine'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { sRGBEncoding } from 'three'

let depsLoaded: Promise<[typeof import('ethereal'), typeof import('react-dom')]>

async function createUIRootLayer<S extends State<any> | null>(
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
  options.textureEncoding = options.textureEncoding ?? sRGBEncoding
  return new Ethereal.WebLayer3D(containerElement, options)
}

export function createXRUI<S extends State<any> | null>(UIFunc: React.FC, state = null as S): XRUI<S> {
  const entity = createEntity()

  createUIRootLayer(UIFunc, state, {
    onLayerPaint: (layer) => {
      layer.contentMesh.material.toneMapped = false
    }
  }).then((uiRoot) => {
    // Make sure entity still exists, since we are adding these components asynchronously,
    // and bad things might happen if we add these components after entity has been removed
    // TODO: revise this pattern after refactor
    if (!Engine.currentWorld.entityQuery().includes(entity)) {
      console.warn('XRUI layer initialized after entity removed from world')
      return
    }
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
