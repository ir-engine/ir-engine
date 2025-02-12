/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { Group } from 'three'

import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { State, getState, isClient } from '@ir-engine/hyperflux'
import { WebContainer3D } from '@ir-engine/xrui/core/three/WebContainer3D'
import { WebLayerManager } from '@ir-engine/xrui/core/three/WebLayerManager'

import { AssetLoaderState } from '@ir-engine/engine/src/assets/state/AssetLoaderState'
import { EngineState } from '../../EngineState'
import { InputComponent } from '../../input/components/InputComponent'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { addObjectToGroup } from '../../renderer/components/GroupComponent'
import { setObjectLayers } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { DistanceFromCameraComponent } from '../../transform/components/DistanceComponents'
import { XRUIComponent } from '../components/XRUIComponent'

export function createXRUI<S extends State<any> | null>(
  UIFunc: React.FC,
  state = null as S,
  settings: { interactable: boolean } = { interactable: true },
  entity = createEntity()
): XRUI<S> {
  if (!isClient) throw new Error('XRUI is not supported in nodejs')

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  containerElement.id = 'xrui-' + UIFunc.name

  // TODO: We can't do this in React Native...
  // const rootElement = createRoot(containerElement!)
  // rootElement.render(
  //   //@ts-ignore
  //   <EntityContext.Provider value={entity}>
  //     {/*
  //     // @ts-ignore */}
  //     <XRUIStateContext.Provider value={state}>
  //       <UIFunc />
  //     </XRUIStateContext.Provider>
  //   </EntityContext.Provider>
  // )

  if (!WebLayerManager.instance) {
    const viewerEntity = getState(EngineState).viewerEntity
    const renderer = getComponent(viewerEntity, RendererComponent)
    const gltfLoader = getState(AssetLoaderState).gltfLoader
    WebLayerManager.initialize(renderer.renderer!, gltfLoader.ktx2Loader!)
  }

  return { entity: createEntity() }

  const container = new WebContainer3D(containerElement, { manager: WebLayerManager.instance })

  container.raycaster.layers.enableAll()

  const root = new Group()
  root.name = containerElement.id
  root.add(container)
  addObjectToGroup(entity, root)
  setObjectLayers(container, ObjectLayers.UI)
  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, XRUIComponent, container)
  setComponent(entity, VisibleComponent, true)
  if (settings.interactable) setComponent(entity, InputComponent, { highlight: false, grow: true })

  return { entity, state, container }
}

export interface XRUI<S> {
  entity: Entity
  state: S
  container: WebContainer3D
}
