import { useHookstate } from '@hookstate/core'
import {
  Entity,
  PresentationSystemGroup,
  UndefinedEntity,
  defineSystem,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { createLoadingSpinner } from '@ir-engine/engine/src/scene/functions/spatialLoadingSpinner'
import { getMutableState } from '@ir-engine/hyperflux'
import {
  removeEntityNodeRecursively,
  useChildrenWithComponents
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { EditorState } from '../services/EditorServices'

const LoadingSpinnerReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const modelComponent = useComponent(entity, ModelComponent)
  const errors = !!useOptionalComponent(entity, ErrorComponent)?.value?.[ModelComponent.name]

  const loadingEntity = useHookstate<Entity>(UndefinedEntity)

  const createLoadingGeo = () => {
    const spinnerEntity = createLoadingSpinner(`loading ${modelComponent.src.value}`, entity)
    loadingEntity.set(spinnerEntity)
  }

  const removeLoadingGeo = () => {
    if (!loadingEntity.value) return
    removeEntityNodeRecursively(loadingEntity.value)
    loadingEntity.set(UndefinedEntity)
  }

  useEffect(() => {
    if (loadingEntity.value) return
    createLoadingGeo()
  }, [modelComponent.src.value])

  useEffect(() => {
    if (!errors) return
    removeLoadingGeo()
  }, [errors])

  useEffect(() => {
    if (!modelComponent.scene.value) return
    removeLoadingGeo()
  }, [modelComponent.scene.value])

  return null
}

const reactor = () => {
  const studioSceneEntity = useHookstate(getMutableState(EditorState)).rootEntity.value
  const entities = useChildrenWithComponents(studioSceneEntity, [ModelComponent, SourceComponent])
  if (!studioSceneEntity) return null
  return (
    <>
      {entities.map((entity) => (
        <LoadingSpinnerReactor key={entity} entity={entity} />
      ))}
    </>
  )
}

export const ModelLoadingSpinnerSystem = defineSystem({
  uuid: 'ee.editor.ModelLoadingSpinnerSystem',
  insert: { before: PresentationSystemGroup },
  reactor
})
