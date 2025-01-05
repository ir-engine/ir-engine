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

import {
  EntityTreeComponent,
  createEntity,
  defineQuery,
  defineSystem,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { Light } from 'three'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { NameComponent } from '../common/NameComponent'
import { AmbientLightComponent, TransformComponent } from './RendererModule'
import { RendererState } from './RendererState'
import { WebGLRendererSystem } from './WebGLRendererSystem'
import { ObjectComponent } from './components/ObjectComponent'
import { VisibleComponent } from './components/VisibleComponent'
import { LightTagComponent } from './components/lights/LightTagComponent'
import { RenderModes } from './constants/RenderModes'

const lightQuery = defineQuery([LightTagComponent, ObjectComponent])

const execute = () => {
  const renderMode = getState(RendererState).renderMode
  if (renderMode === RenderModes.UNLIT) {
    for (const entity of lightQuery()) {
      const object = getComponent(entity, ObjectComponent) as Light
      object.visible = !object.isLight
    }
  }
}

const reactor = () => {
  const renderer = useMutableState(RendererState)

  useEffect(() => {
    if (renderer.renderMode.value !== RenderModes.UNLIT) return

    const ambientLightEntity = createEntity()
    setComponent(ambientLightEntity, NameComponent, 'Origin Ambient Light')
    setComponent(ambientLightEntity, AmbientLightComponent)
    setComponent(ambientLightEntity, VisibleComponent)
    setComponent(ambientLightEntity, EntityTreeComponent, { parentEntity: getState(ReferenceSpaceState).originEntity })
    setComponent(ambientLightEntity, TransformComponent)
    return () => {
      removeEntity(ambientLightEntity)
    }
  }, [renderer.renderMode])

  return null
}

export const ViewportLightingSystem = defineSystem({
  uuid: 'ee.engine.ViewportLightingSystem',
  insert: { before: WebGLRendererSystem },
  execute,
  reactor
})
