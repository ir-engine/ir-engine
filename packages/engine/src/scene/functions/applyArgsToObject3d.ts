import { ShadowComponent } from '../components/ShadowComponent'
import { Object3D } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { Color } from 'three'
import { getComponent } from '../../ecs/functions/ComponentFunctions'

export const applyArgsToObject3d = <T extends Object3D>(entity: Entity, object3d: T, objArgs?: any) => {
  /**
   * apply value to sub object by path, like material.color = '#fff' will set { material:{ color }}
   * @param subj
   * @param path
   * @param value
   */
  const applyDeepValue = (subj: object, path: string, value: unknown): void => {
    if (!subj) {
      console.warn('subj is not an object', subj)
      return
    }
    const groups = path.match(/(?<property>[^.]+)(\.(?<nextPath>.*))?/)?.groups
    if (!groups) {
      return
    }
    const { property, nextPath } = groups

    if (!property) {
      // console.warn('property not found', property);
      return
    }
    if (nextPath) {
      return applyDeepValue(subj[property], nextPath, value)
    }

    if (subj[property] instanceof Color && (typeof value === 'number' || typeof value === 'string')) {
      subj[property] = new Color(value)
    } else {
      subj[property] = value
    }
  }

  typeof objArgs === 'object' &&
    Object.keys(objArgs).forEach((key) => {
      applyDeepValue(object3d, key, objArgs[key])
    })

  const hasShadow = getComponent(entity, ShadowComponent)
  const castShadow = Boolean(hasShadow?.castShadow || objArgs?.castShadow)
  const receiveshadow = Boolean(hasShadow?.receiveShadow || objArgs?.receiveShadow)

  object3d.traverse((obj) => {
    obj.castShadow = castShadow
    obj.receiveShadow = receiveshadow
  })

  return object3d
}
