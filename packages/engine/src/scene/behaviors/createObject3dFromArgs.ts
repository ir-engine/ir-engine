import { Engine } from '../../ecs/classes/Engine'
import ShadowComponent from '../components/ShadowComponent'
import { createShadow } from './createShadow'
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem'
import { isClient } from '../../common/functions/isClient'
import { Entity } from '../../ecs/classes/Entity'
import { Component } from '../../ecs/classes/Component'
import { Color } from 'three'
import { getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions'

export const createObject3dFromArgs = (entity: Entity, args: any, addToScene: boolean) => {
  const isObject3d = typeof args.obj3d === 'object'
  let object3d

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

  if (isObject3d) object3d = args.obj3d
  else object3d = new args.obj3d()

  typeof args.objArgs === 'object' &&
    Object.keys(args.objArgs).forEach((key) => {
      applyDeepValue(object3d, key, args.objArgs[key])
    })

  if (addToScene) {
    if (args.parentEntity && hasComponent(args.parentEntity, ShadowComponent)) {
      createShadow(entity, getMutableComponent(args.parentEntity, ShadowComponent))
    }
  }

  const hasShadow = getMutableComponent(entity, ShadowComponent)
  const castShadow = Boolean(hasShadow?.castShadow || args.objArgs?.castShadow)
  const receiveshadow = Boolean(hasShadow?.receiveShadow || args.objArgs?.receiveShadow)

  object3d.traverse((obj) => {
    obj.castShadow = castShadow
    obj.receiveShadow = receiveshadow
  })

  return object3d
}
