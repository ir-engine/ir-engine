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

import React, { useEffect } from 'react'

import { Entity } from '@ir-engine/ecs'
import { defineComponent, hasComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { parseStorageProviderURLs } from '@ir-engine/engine/src/assets/functions/parseSceneJSON'
import { useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { useAncestorWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { GraphJSON, IRegistry, VisualScriptState, defaultVisualScript } from '@ir-engine/visual-script'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { useVisualScriptRunner } from '../systems/useVisualScriptRunner'

export enum VisualScriptDomain {
  'ECS' = 'ECS'
}

export const VisualScriptComponent = defineComponent({
  name: 'VisualScriptComponent',
  jsonID: 'EE_visual_script',

  schema: S.Object({
    domain: S.Enum(VisualScriptDomain, VisualScriptDomain.ECS),
    visualScript: S.Nullable(S.Type<GraphJSON>(), null, {
      deserialize(curr, value) {
        if (!value) return value
        return parseStorageProviderURLs(value)
      }
    }),
    run: S.Bool(false),
    disabled: S.Bool(false)
  }),

  // we make reactor for each component handle the engine
  reactor: () => {
    const entity = useEntityContext()
    const visualScript = useComponent(entity, VisualScriptComponent)
    const visualScriptState = useMutableState(VisualScriptState)
    const canPlay = visualScript.run.value && !visualScript.disabled.value
    const registry = visualScriptState.registries[visualScript.domain.value].get({ noproxy: true }) as IRegistry
    const gltfAncestor = useAncestorWithComponents(entity, [GLTFComponent])

    useImmediateEffect(() => {
      if (visualScript.visualScript.value === null)
        visualScript.visualScript.set(parseStorageProviderURLs(defaultVisualScript))
    }, [])

    const visualScriptRunner = useVisualScriptRunner({
      visualScriptJson: visualScript.visualScript.get({ noproxy: true }) as GraphJSON,
      autoRun: canPlay,
      registry
    })

    useEffect(() => {
      if (visualScript.disabled.value) return
      visualScript.run.value ? visualScriptRunner.play() : visualScriptRunner.pause()
    }, [visualScript.run])

    useEffect(() => {
      if (!visualScript.disabled.value) return
      visualScript.run.set(false)
    }, [visualScript.disabled])

    if (!gltfAncestor) return null

    return <LoadReactor entity={entity} gltfAncestor={gltfAncestor} key={gltfAncestor} />
  }
})

const LoadReactor = (props: { entity: Entity; gltfAncestor: Entity }) => {
  const loaded = GLTFComponent.useSceneLoaded(props.gltfAncestor)

  useEffect(() => {
    setComponent(props.entity, VisualScriptComponent, { run: true })

    return () => {
      if (!hasComponent(props.entity, VisualScriptComponent)) return
      setComponent(props.entity, VisualScriptComponent, { run: false })
    }
  }, [loaded])

  return null
}
