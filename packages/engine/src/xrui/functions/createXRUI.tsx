import { State } from '@hookstate/core'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Group } from 'three'

import { WebContainer3D } from '@etherealengine/xrui/core/three/WebContainer3D'
import { WebLayerManager } from '@etherealengine/xrui/core/three/WebLayerManager'

import { isClient } from '../../common/functions/getEnvironment'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, getMutableComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { DistanceFromCameraComponent } from '../../transform/components/DistanceComponents'
import { setTransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '../components/XRUIComponent'
import { XRUIStateContext } from '../XRUIStateContext'

export function createXRUI<S extends State<any> | null>(UIFunc: React.FC, state = null as S): XRUI<S> {
  if (!isClient) throw new Error('XRUI is not supported in nodejs')

  const entity = createEntity()

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  containerElement.id = 'xrui-' + UIFunc.name

  const rootElement = createRoot(containerElement!)
  rootElement.render(
    //@ts-ignore
    <XRUIStateContext.Provider value={state}>
      <UIFunc />
    </XRUIStateContext.Provider>
  )

  const container = new WebContainer3D(containerElement, { manager: WebLayerManager.instance })

  container.raycaster.layers.enableAll()

  const root = new Group()
  root.name = containerElement.id
  root.add(container)
  setTransformComponent(entity)
  addObjectToGroup(entity, root)
  setObjectLayers(container, ObjectLayers.UI)
  setComponent(entity, DistanceFromCameraComponent)
  addComponent(entity, XRUIComponent, container)
  addComponent(entity, VisibleComponent, true)

  return { entity, state, container }
}

export interface XRUI<S> {
  entity: Entity
  state: S
  container: WebContainer3D
}
