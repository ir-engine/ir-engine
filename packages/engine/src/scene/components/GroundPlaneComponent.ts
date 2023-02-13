import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { useEffect } from 'react'
import { Color, Mesh, MeshLambertMaterial, PlaneGeometry, ShadowMaterial } from 'three'

import { matches } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { Physics } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { ObjectLayers } from '../constants/ObjectLayers'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { enableObjectLayer } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const GroundPlaneComponent = defineComponent({
  name: 'GroundPlaneComponent',

  onInit(entity, world) {
    return {
      color: new Color(),
      visible: true,
      mesh: null! as Mesh<PlaneGeometry, MeshLambertMaterial | ShadowMaterial>
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (matches.object.test(json.color) || matches.string.test(json.color) || matches.number.test(json.color))
      component.color.value.set(json.color)
    if (matches.boolean.test(json.visible)) component.visible.set(json.visible)
    if (matches.object.test(json.mesh)) component.mesh.set(json.mesh as any)
  },

  toJSON(entity, component) {
    return {
      color: component.color.value.getHex(),
      visible: component.visible.value
    }
  },

  reactor: function ({ root }) {
    const entity = root.entity

    const component = useComponent(entity, GroundPlaneComponent)

    useEffect(() => {
      const radius = 10000

      const mesh = new Mesh(
        new PlaneGeometry(radius, radius),
        component.visible.value ? new MeshLambertMaterial() : new ShadowMaterial({ opacity: 0.5 })
      )
      component.mesh.set(mesh)
      mesh.geometry.rotateX(-Math.PI / 2)
      mesh.name = 'GroundPlaneMesh'
      mesh.material.polygonOffset = true
      mesh.material.polygonOffsetUnits = -0.01
      mesh.traverse(generateMeshBVH)

      enableObjectLayer(mesh, ObjectLayers.Camera, true)
      addObjectToGroup(entity, mesh)

      const rigidBodyDesc = RigidBodyDesc.fixed()
      const colliderDesc = ColliderDesc.cuboid(radius * 2, 0.001, radius * 2)
      colliderDesc.setCollisionGroups(
        getInteractionGroups(CollisionGroups.Ground, CollisionGroups.Default | CollisionGroups.Avatars)
      )

      Physics.createRigidBody(entity, Engine.instance.currentWorld.physicsWorld, rigidBodyDesc, [colliderDesc])

      return () => {
        Physics.removeRigidBody(entity, Engine.instance.currentWorld.physicsWorld)
        removeObjectFromGroup(entity, component.mesh.value)
      }
    }, [])

    return null
  }
})

export const SCENE_COMPONENT_GROUND_PLANE = 'ground-plane'
