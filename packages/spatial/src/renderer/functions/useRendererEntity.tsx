import { Entity, UndefinedEntity, getComponent, useOptionalComponent, useQuery } from '@etherealengine/ecs'
import { startReactor, useHookstate, useImmediateEffect } from '@etherealengine/hyperflux'
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

      useLayoutEffect(() => {
        if (!matchesQuery) return
        result.set(matchesQuery)
        return () => {
          if (!unmounted) result.set(UndefinedEntity)
        }
      }, [tree?.parentEntity?.value, matchesQuery])

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
