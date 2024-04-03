import {
  Entity,
  PresentationSystemGroup,
  QueryReactor,
  defineSystem,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { BackgroundComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import React, { useEffect } from 'react'
import { EnvmapComponent, updateEnvMap } from '../components/EnvmapComponent'
import { EnvMapSourceType } from '../constants/EnvMapEnum'

const EnvmapReactor = (props: { backgroundEntity: Entity }) => {
  const entity = useEntityContext()
  const envmapComponent = useComponent(entity, EnvmapComponent)
  const backgroundComponent = useComponent(props.backgroundEntity, BackgroundComponent)
  const groupComponent = useComponent(entity, GroupComponent)

  useEffect(() => {
    if (envmapComponent.type.value !== EnvMapSourceType.Skybox) return
    for (const obj of groupComponent.value) {
      updateEnvMap(obj as any, backgroundComponent.value as any)
    }
  }, [envmapComponent.type, backgroundComponent])

  return null
}

const BackgroundReactor = () => {
  const backgroundEntity = useEntityContext()
  return <QueryReactor Components={[EnvmapComponent]} ChildEntityReactor={EnvmapReactor} props={{ backgroundEntity }} />
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => <QueryReactor Components={[BackgroundComponent]} ChildEntityReactor={BackgroundReactor} />
})
