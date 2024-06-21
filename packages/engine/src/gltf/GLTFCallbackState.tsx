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

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  generateEntityUUID,
  getComponent,
  removeEntity,
  setComponent,
  useOptionalComponent
} from '@etherealengine/ecs'
import { defineState, getMutableState, getState, none, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { SourceComponent, SourceID } from '@etherealengine/spatial/src/transform/components/SourceComponent'
import React, { useEffect } from 'react'
import { GLTFComponent } from './GLTFComponent'
import { GLTFSourceState } from './GLTFState'

export type GLTFCallback = (entity: Entity) => void

/** Calls a callback once a GLTF document is loaded */
export const GLTFCallbackState = defineState({
  name: 'ir.engine.gltf.GLTFCallbackState',
  initial: {} as Record<EntityUUID, { filePath: string; callback: GLTFCallback }>,
  reactor: () => {
    const state = useMutableState(GLTFCallbackState)
    return (
      <>
        {state.keys.map((key: EntityUUID) => (
          <Reactor key={key} id={key} />
        ))}
      </>
    )
  },

  add: (filePath: string, callback: GLTFCallback) => {
    const id = generateEntityUUID() as EntityUUID
    getMutableState(GLTFCallbackState).merge({
      [id]: {
        filePath,
        callback
      }
    })
    return id
  }
})

const Reactor = (props: { id: EntityUUID }) => {
  const { filePath } = useHookstate(getMutableState(GLTFCallbackState)[props.id]).value
  const state = useHookstate({ entity: UndefinedEntity })

  useEffect(() => {
    const entity = createEntity()
    setComponent(entity, UUIDComponent, props.id)
    const sourceID = `${getComponent(entity, UUIDComponent)}-${filePath}` as SourceID
    setComponent(entity, SourceComponent, sourceID)
    setComponent(entity, EntityTreeComponent)
    setComponent(entity, GLTFComponent, { src: filePath })
    getMutableState(GLTFSourceState)[sourceID].set(entity)
    state.merge({ entity })
  }, [])

  if (!state.entity.value) return null

  return <GLTFLoadingReactor id={props.id} entity={state.entity.value} />
}

const GLTFLoadingReactor = (props: { id: EntityUUID; entity: Entity }) => {
  const gltfLoaded = useOptionalComponent(props.entity, GLTFComponent)?.progress?.value === 100

  useEffect(() => {
    if (!gltfLoaded) return
    getState(GLTFCallbackState)[props.id].callback(props.entity)
    removeEntity(props.entity)
    const sourceID = getComponent(props.entity, SourceComponent)
    getMutableState(GLTFSourceState)[sourceID].set(none)
    getMutableState(GLTFCallbackState)[props.id].set(none)
  }, [gltfLoaded])

  return null
}
