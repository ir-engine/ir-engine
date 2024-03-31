import { defineComponent } from '@etherealengine/ecs'

export const SceneComponents = {} as Record<string, SceneComponent>

export const createSceneComponent = (sceneID: string) => {
  const Component = defineComponent({
    name: sceneID
  })
  SceneComponents[sceneID] = Component
  return Component
}

export const DefaultScene = createSceneComponent('default')

export type SceneComponent = typeof DefaultScene
