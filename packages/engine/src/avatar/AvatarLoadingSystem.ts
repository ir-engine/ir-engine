import { Easing, Tween } from '@tweenjs/tween.js'
import {
  AdditiveBlending,
  Box3,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  sRGBEncoding,
  Vector3
} from 'three'

import { AssetLoader } from '../assets/classes/AssetLoader'
import { AvatarDirection } from '../common/constants/Axis3D'
import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { removeEntity } from '../ecs/functions/EntityFunctions'
import { Physics, RaycastArgs } from '../physics/classes/Physics'
import { AvatarCollisionMask, CollisionGroups } from '../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../physics/functions/getInteractionGroups'
import { SceneQueryType } from '../physics/types/PhysicsTypes'
import { addObjectToGroup, GroupComponent } from '../scene/components/GroupComponent'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { setTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { TweenComponent } from '../transform/components/TweenComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarDissolveComponent } from './components/AvatarDissolveComponent'
import { AvatarEffectComponent } from './components/AvatarEffectComponent'
import { DissolveEffect } from './DissolveEffect'

const lightScale = (y, r) => {
  return Math.min(1, Math.max(1e-3, y / r))
}

const lightOpacity = (y, r) => {
  return Math.min(1, Math.max(0, 1 - (y - r) * 0.5))
}

const downwardGroundRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: AvatarDirection.Down,
  maxDistance: 10,
  groups: getInteractionGroups(CollisionGroups.Avatars, AvatarCollisionMask)
} as RaycastArgs

export default async function AvatarLoadingSystem(world: World) {
  const effectQuery = defineQuery([AvatarEffectComponent])
  const growQuery = defineQuery([AvatarEffectComponent, Object3DComponent])
  const commonQuery = defineQuery([AvatarEffectComponent, Object3DComponent])
  const dissolveQuery = defineQuery([AvatarEffectComponent, Object3DComponent, AvatarDissolveComponent])
  const [textureLight, texturePlate] = await Promise.all([
    AssetLoader.loadAsync('/itemLight.png'),
    AssetLoader.loadAsync('/itemPlate.png')
  ])

  const light = new Mesh(
    new PlaneGeometry(0.04, 3.2),
    new MeshBasicMaterial({
      transparent: true,
      map: textureLight,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )

  const plate = new Mesh(
    new PlaneGeometry(1.6, 1.6),
    new MeshBasicMaterial({
      transparent: false,
      map: texturePlate,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )

  light.geometry.computeBoundingSphere()
  plate.geometry.computeBoundingSphere()
  light.name = 'light_obj'
  plate.name = 'plate_obj'

  textureLight.encoding = sRGBEncoding
  textureLight.needsUpdate = true
  texturePlate.encoding = sRGBEncoding
  texturePlate.needsUpdate = true

  const execute = () => {
    const { deltaSeconds: delta } = world

    for (const entity of effectQuery.enter()) {
      const effectComponent = getComponent(entity, AvatarEffectComponent)
      const sourceTransform = getComponent(effectComponent.sourceEntity, TransformComponent)
      const transform = setTransformComponent(
        entity,
        sourceTransform.position.clone(),
        sourceTransform.rotation.clone(),
        sourceTransform.scale.clone()
      )
      addComponent(entity, VisibleComponent, true)
      /**
       * cast ray to move this downward to be on the ground
       */
      downwardGroundRaycast.origin.copy(sourceTransform.position)
      const hits = Physics.castRay(Engine.instance.currentWorld.physicsWorld, downwardGroundRaycast)
      if (hits.length) {
        transform.position.y = hits[0].position.y
      }

      const group = new Group()

      const pillar = new Object3D()
      pillar.name = 'pillar_obj'
      addObjectToGroup(entity, group)
      group.add(pillar)

      const R = 0.6 * plate.geometry.boundingSphere?.radius!
      for (let i = 0, n = 5 + 10 * R * Math.random(); i < n; i += 1) {
        const ray = light.clone()
        ray.position.y -= 2 * ray.geometry.boundingSphere?.radius! * Math.random()

        var a = (2 * Math.PI * i) / n,
          r = R * Math.random()
        ray.position.x += r * Math.cos(a)
        ray.position.z += r * Math.sin(a)

        ray.rotation.y = Math.random() * 2 * Math.PI
        pillar.add(ray)
      }

      const pt = plate.clone()
      pt.name = 'plate_obj'
      pt.material = (pt.material as any).clone()
      pt.rotation.x = -0.5 * Math.PI
      group.add(pt)

      setComponent(entity, TweenComponent, {
        tween: new Tween<any>(effectComponent)
          .to(
            {
              opacityMultiplier: 1
            },
            1000
          )
          .easing(Easing.Exponential.Out)
          .start()
          .onComplete(() => {
            removeComponent(entity, TweenComponent)
            const avatarObjects = getComponent(effectComponent.sourceEntity, GroupComponent)
            const bbox = new Box3()
            let scale = 1
            for (const obj of avatarObjects) {
              bbox.expandByObject(obj)
              if (obj.userData?.scale) {
                scale = obj.userData.scale
              }
            }
            setComponent(entity, AvatarDissolveComponent, {
              /** @todo refactor to not be just the first index */
              effect: new DissolveEffect(avatarObjects[0], bbox.min.y / scale, bbox.max.y / scale)
            })
          })
      })
    }

    for (const entity of growQuery(world)) {
      const object = getComponent(entity, Object3DComponent).value
      object.updateWorldMatrix(true, true)
    }

    for (const entity of commonQuery(world)) {
      const object = getComponent(entity, Object3DComponent).value
      const opacityMultiplier = getComponent(entity, AvatarEffectComponent).opacityMultiplier

      let pillar: any = null!
      let plate: any = null!

      const childrens = object.children
      for (let i = 0; i < childrens.length; i++) {
        if (childrens[i].name === 'pillar_obj') pillar = childrens[i]
        if (childrens[i].name === 'plate_obj') plate = childrens[i]
      }

      if (pillar !== null && plate !== null) {
        plate['material'].opacity = opacityMultiplier * (0.7 + 0.5 * Math.sin((Date.now() % 6283) * 5e-3))
        if (pillar !== undefined && plate !== undefined) {
          for (var i = 0, n = pillar.children.length; i < n; i++) {
            var ray = pillar.children[i]
            ray.position.y += 2 * delta
            ray.scale.y = lightScale(ray.position.y, ray['geometry'].boundingSphere.radius)
            ray['material'].opacity = lightOpacity(ray.position.y, ray['geometry'].boundingSphere.radius)

            if (ray['material'].opacity < 1e-3) {
              ray.position.y = plate.position.y
            }
            ray['material'].opacity *= opacityMultiplier
          }
        }
      }
    }

    for (const entity of dissolveQuery.enter(world)) {
      const effectComponent = getComponent(entity, AvatarEffectComponent)
      if (hasComponent(effectComponent.sourceEntity, AvatarControllerComponent))
        getComponent(effectComponent.sourceEntity, AvatarControllerComponent).movementEnabled = true
    }

    for (const entity of dissolveQuery(world)) {
      const disolveEffect = getComponent(entity, AvatarDissolveComponent).effect

      if (disolveEffect.update(delta)) {
        removeComponent(entity, AvatarDissolveComponent)
        const effectComponent = getComponent(entity, AvatarEffectComponent)
        const avatarObject = getComponent(effectComponent.sourceEntity, Object3DComponent).value

        effectComponent.originMaterials.forEach(({ id, material }) => {
          avatarObject.traverse((obj) => {
            if (obj.uuid === id) {
              obj['material'] = material
            }
          })
        })

        setComponent(entity, TweenComponent, {
          tween: new Tween<any>(effectComponent)
            .to(
              {
                opacityMultiplier: 0
              },
              2000
            )
            .start()
            .onComplete(async () => {
              const objects = getComponent(entity, GroupComponent)
              let pillar: Mesh = null!
              let plate: Mesh = null!
              for (const obj of objects) {
                const childrens = obj.children as Mesh[]
                for (let i = 0; i < childrens.length; i++) {
                  if (childrens[i].name === 'pillar_obj') pillar = childrens[i]
                  if (childrens[i].name === 'plate_obj') plate = childrens[i]
                }
              }

              if (pillar !== null) {
                pillar.traverse(function (child) {
                  if (child['material']) child['material'].dispose()
                })

                pillar.removeFromParent()
              }

              if (plate !== null) {
                plate.traverse(function (child) {
                  if (child['material']) child['material'].dispose()
                })

                plate.removeFromParent()
              }

              removeEntity(entity)
            })
        })
      }
    }
  }

  const cleanup = async () => {
    removeQuery(world, effectQuery)
    removeQuery(world, growQuery)
    removeQuery(world, commonQuery)
    removeQuery(world, dissolveQuery)
  }

  return { execute, cleanup }
}
