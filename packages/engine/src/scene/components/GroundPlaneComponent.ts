/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Color, Mesh, MeshLambertMaterial, PlaneGeometry, ShadowMaterial } from 'three'

import { getState } from '@etherealengine/hyperflux'

import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { matches } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@etherealengine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { enableObjectLayer } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { SceneObjectComponent } from './SceneObjectComponent'

export const GroundPlaneComponent = defineComponent({
  name: 'GroundPlaneComponent',
  jsonID: 'ground-plane',

  onInit(entity) {
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

    /**
     * Add SceneAssetPendingTagComponent to tell scene loading system we should wait for this asset to load
     */
    if (
      !getState(SceneState).sceneLoaded &&
      hasComponent(entity, SceneObjectComponent) &&
      !hasComponent(entity, RigidBodyComponent)
    )
      SceneAssetPendingTagComponent.addResource(entity, GroundPlaneComponent.jsonID)
  },

  toJSON(entity, component) {
    return {
      color: component.color.value,
      visible: component.visible.value
    }
  },

  reactor: function () {
    const entity = useEntityContext()

    const component = useComponent(entity, GroundPlaneComponent)

    useEffect(() => {
      const mesh = new Mesh(
        new PlaneGeometry(10000, 10000),
        component.visible.value ? new MeshLambertMaterial() : new ShadowMaterial({ opacity: 0.5 })
      )
      component.mesh.set(mesh)
      mesh.geometry.rotateX(-Math.PI / 2)
      mesh.name = 'GroundPlaneMesh'
      mesh.material.polygonOffset = true
      mesh.material.polygonOffsetFactor = -0.01
      mesh.material.polygonOffsetUnits = 1

      addObjectToGroup(entity, mesh)
      enableObjectLayer(mesh, ObjectLayers.Camera, true)
      setComponent(entity, MeshComponent, mesh)

      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(entity, ColliderComponent, {
        shape: Shapes.Plane,
        collisionLayer: CollisionGroups.Ground,
        collisionMask: CollisionGroups.Default | CollisionGroups.Avatars
      })

      SceneAssetPendingTagComponent.removeResource(entity, GroundPlaneComponent.jsonID)
      return () => {
        removeComponent(entity, RigidBodyComponent)
        removeComponent(entity, ColliderComponent)
        removeObjectFromGroup(entity, mesh)
      }
    }, [])

    useEffect(() => {
      if (component.mesh.value) component.mesh.value.material.color.set(component.color.value)
    }, [component.color])

    useEffect(() => {
      if (component.mesh.value)
        component.mesh.value.material = component.visible.value
          ? new MeshLambertMaterial({ color: component.color.value })
          : new ShadowMaterial({ opacity: 0.5 })
    }, [component.visible])

    return null
  }
})
