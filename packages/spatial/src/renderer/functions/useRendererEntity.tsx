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

import { Entity, UndefinedEntity, getComponent, useOptionalComponent, useQuery } from '@ir-engine/ecs'
import { startReactor, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import React, { useLayoutEffect } from 'react'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { RendererComponent } from '../WebGLRendererSystem'

/**
 * Returns the renderer entity that is rendering the specified entity
 * @param {Entity} entity
 * @returns {Entity}
 */
export function useRendererEntity(entity: Entity) {
  const result = useHookstate(UndefinedEntity)

  useImmediateEffect(() => {
    let unmounted = false
    const ParentSubReactor = (props: { entity: Entity }) => {
      const tree = useOptionalComponent(props.entity, EntityTreeComponent)
      const renderers = useQuery([RendererComponent])
      const matchesQuery = renderers.find((r) => getComponent(r, RendererComponent).scenes.includes(props.entity))
      const hasRenderer = !!useOptionalComponent(matchesQuery ?? UndefinedEntity, RendererComponent)?.renderer

      useLayoutEffect(() => {
        if (!matchesQuery || !hasRenderer) return
        result.set(matchesQuery)
        return () => {
          if (!unmounted) result.set(UndefinedEntity)
        }
      }, [tree?.parentEntity?.value, matchesQuery, hasRenderer])

      if (matchesQuery) return null

      if (!tree?.parentEntity?.value) return null

      return <ParentSubReactor key={tree.parentEntity.value} entity={tree.parentEntity.value} />
    }

    const root = startReactor(function useQueryReactor() {
      return <ParentSubReactor entity={entity} key={entity} />
    })
    return () => {
      unmounted = true
      root.stop()
    }
  }, [entity])

  return result.value
}
