import { Entity } from '../../ecs/classes/Entity'
import { ScenePropertyType, WorldScene } from '../functions/SceneLoading'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'
import fs from 'fs'

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
      const url = component.props.scriptUrl
      let code: string = ''
      if (typeof window === 'undefined') {
        require('node-fetch')(url)
          .then(async (res) => {
            code = await res.text()
            console.log(code)
          })
          .catch((error) => {
            console.log('Error loading:' + error)
            reject()
          })
      } else {
        fetch(url)
          .then(async (res) => {
            code = await res.text()
            console.log(code)
          })
          .catch((error) => {
            console.log('Error loading:' + error)
            reject()
          })
      }

      resolve()
    })
  )
}
