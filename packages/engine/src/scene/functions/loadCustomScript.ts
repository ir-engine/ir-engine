import { Entity } from '../../ecs/classes/Entity'
import { ScenePropertyType, WorldScene } from '../functions/SceneLoading'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'

/**
 * @author Abhishek Pathak
 * @param sceneLoader
 * @param entity
 * @param component
 * @param sceneProperty
 */
export const loadCustomScript = (
  sceneLoader: WorldScene,
  entity: Entity,
  component: SceneDataComponent,
  sceneProperty: ScenePropertyType
) => {
  sceneLoader.loaders.push(
    new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = component.props.scriptUrl
      s.onload = resolve as any
      s.onerror = reject as any
      document.head.appendChild(s)
    })
  )
}
