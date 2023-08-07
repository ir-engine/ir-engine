/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { State } from '@hookstate/core'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Group } from 'three'

import { WebContainer3D } from '@etherealengine/xrui/core/three/WebContainer3D'
import { WebLayerManager } from '@etherealengine/xrui/core/three/WebLayerManager'

import { isClient } from '../../common/functions/getEnvironment'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { InputComponent } from '../../input/components/InputComponent'
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
  setComponent(entity, InputComponent)

  return { entity, state, container }
}

export interface XRUI<S> {
  entity: Entity
  state: S
  container: WebContainer3D
}
