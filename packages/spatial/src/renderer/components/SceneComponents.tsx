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

import React, { useEffect, useLayoutEffect } from 'react'
import { Color, CubeTexture, FogBase, Texture } from 'three'

import {
  defineComponent,
  Entity,
  EntityUUID,
  getComponent,
  QueryReactor,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  UUIDComponent
} from '@etherealengine/ecs'
import { hookstate, NO_PROXY, none, startReactor, useHookstate } from '@etherealengine/hyperflux'

import { useAncestorWithComponent, useTreeQuery } from '../../transform/components/EntityTree'

/**
 * Creates a scene tag component for each of the entities added to a scene
 * @param entity
 * @returns
 */
const createSceneComponent = (entity: Entity) => {
  const uuid = getComponent(entity, UUIDComponent)
  return defineComponent({
    name: 'SceneComponent-' + uuid
  })
}

type SceneComponentType = ReturnType<typeof createSceneComponent>

const scenes = {} as Record<EntityUUID, SceneComponentType>
const sceneByEntity = {} as Record<Entity, EntityUUID>

export const SceneComponent = defineComponent({
  name: 'SceneComponent',

  onInit(entity) {
    return {
      scenes: [] as Entity[]
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (Array.isArray(json.scenes)) component.scenes.set(json.scenes)
  },

  reactor: SceneReactor as any, // somehow, typescript freaks out about this...

  scenes,
  sceneState: hookstate(scenes),

  sceneByEntity,
  sceneByEntityState: hookstate(sceneByEntity)
})

function SceneReactor() {
  const entity = useEntityContext()
  const scenes = useComponent(entity, SceneComponent).scenes.value
  return (
    <>
      {scenes.map((e) => (
        <SceneComponentReactor entity={e} key={e} />
      ))}
    </>
  )
}

const SceneComponentReactor = (props: { entity: Entity }) => {
  const treeEntities = useTreeQuery(props.entity)
  const Component = useHookstate(() => createSceneComponent(props.entity))

  useLayoutEffect(() => {
    const uuid = getComponent(props.entity, UUIDComponent)
    SceneComponent.sceneState.merge({ [uuid]: Component.get(NO_PROXY) })
    return () => {
      SceneComponent.sceneState[uuid].set(none)
    }
  }, [])

  return (
    <>
      {treeEntities.map((e) => (
        <SceneComponentTreeReactor entity={e} key={e} Component={Component.get(NO_PROXY) as any} />
      ))}
    </>
  )
}

const SceneComponentTreeReactor = (props: { entity: Entity; Component: SceneComponentType }) => {
  useLayoutEffect(() => {
    setComponent(props.entity, props.Component)
    return () => {
      removeComponent(props.entity, props.Component)
    }
  }, [])
  return null
}

/**
 * Returns the scene entity ancestor for a given entity (if one exists)
 * @todo Benchmark this - could be kind of expensive?
 * @param entity
 * @returns
 */
export function useScene(entity: Entity) {
  const result = useHookstate(UndefinedEntity)

  useLayoutEffect(() => {
    let unmounted = false

    function SceneSubChildReactor(props: { sceneEntity: Entity; sceneUUID: EntityUUID }) {
      const SceneChildComponent = useHookstate(SceneComponent.sceneState[props.sceneUUID])
      const ancestor = useAncestorWithComponent(entity, SceneChildComponent.get(NO_PROXY))

      useEffect(() => {
        if (!ancestor) return

        result.set(props.sceneEntity)

        return () => {
          if (!unmounted) {
            result.set(UndefinedEntity)
          }
        }
      }, [ancestor])

      return null
    }

    function SceneSubReactor() {
      const sceneEntity = useEntityContext()
      const scenes = useHookstate(SceneComponent.sceneState)
      return (
        <>
          {scenes.keys.map((uuid: EntityUUID) => (
            <SceneSubChildReactor sceneEntity={sceneEntity} sceneUUID={uuid} key={uuid} />
          ))}
        </>
      )
    }

    const root = startReactor(function useQueryReactor() {
      return <QueryReactor Components={[SceneComponent]} ChildEntityReactor={SceneSubReactor} />
    })

    return () => {
      unmounted = true
      root.stop()
    }
  }, [entity])

  return result.value
}

export const BackgroundComponent = defineComponent({
  name: 'BackgroundComponent',

  onInit(entity) {
    return null! as Color | Texture | CubeTexture
  },

  onSet(entity, component, json: Color | Texture | CubeTexture) {
    if (typeof json === 'object') component.set(json)
  }
})

export const EnvironmentMapComponent = defineComponent({
  name: 'EnvironmentMapComponent',

  onInit(entity) {
    return null! as Texture
  },

  onSet(entity, component, json: Texture) {
    if (typeof json === 'object') component.set(json)
  }
})

export const FogComponent = defineComponent({
  name: 'FogComponent',

  onInit(entity) {
    return null! as FogBase
  },

  onSet(entity, component, json: FogBase) {
    if (typeof json === 'object') component.set(json)
  }
})
