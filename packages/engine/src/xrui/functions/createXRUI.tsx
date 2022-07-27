import { WebContainer3D, WebLayerManager } from '@etherealjs/web-layer/three'
import { State } from '@hookstate/core'
import React from 'react'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { XRUIComponent } from '../components/XRUIComponent'
import { XRUIStateContext } from '../XRUIStateContext'

let Ethereal: typeof import('@etherealjs/web-layer/three')
let ReactDOM: typeof import('react-dom')

export async function loadXRUIDeps() {
  ;[Ethereal, ReactDOM] = await Promise.all([import('@etherealjs/web-layer/three'), import('react-dom')])
}

function createWebContainer<S extends State<any> | null>(
  UI: React.FC,
  state: S,
  options: import('@etherealjs/web-layer/three').WebContainer3DOptions
) {
  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  containerElement.id = 'xrui-' + UI.name

  ReactDOM.render(
    //@ts-ignore
    <XRUIStateContext.Provider value={state}>
      <UI />
    </XRUIStateContext.Provider>,
    containerElement
  )

  options.autoRefresh = options.autoRefresh ?? true
  return new Ethereal.WebContainer3D(containerElement, options)
}

export function createXRUI<S extends State<any> | null>(UIFunc: React.FC, state = null as S): XRUI<S> {
  const entity = createEntity()

  const container = createWebContainer(UIFunc, state, {
    manager: WebLayerManager.instance
  })

  container.raycaster.layers.enableAll()

  addComponent(entity, Object3DComponent, { value: container })
  setObjectLayers(container, ObjectLayers.UI)
  addComponent(entity, XRUIComponent, { container: container })
  addComponent(entity, VisibleComponent, true)

  return { entity, state, container }
}

export interface XRUI<S> {
  entity: Entity
  state: S
  container: WebContainer3D
}
