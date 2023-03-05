import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import { useEffect } from 'react'
import {
  BackSide,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  SphereGeometry,
  Vector3
} from 'three'

import { getState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import {
  addComponent,
  ComponentType,
  createMappedComponent,
  defineComponent,
  hasComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { RendererState } from '../../renderer/RendererState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { portalTriggerEnter } from '../functions/loaders/PortalFunctions'
import { setObjectLayers } from '../functions/setObjectLayers'
import { setCallback } from './CallbackComponent'
import { ColliderComponent } from './ColliderComponent'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const PortalPreviewTypeSimple = 'Simple' as const
export const PortalPreviewTypeSpherical = 'Spherical' as const

export const PortalPreviewTypes = new Set<string>()
PortalPreviewTypes.add(PortalPreviewTypeSimple)
PortalPreviewTypes.add(PortalPreviewTypeSpherical)

export const PortalEffects = new Map<string, ComponentType<any>>()
PortalEffects.set('None', null!)

export const SCENE_COMPONENT_PORTAL = 'portal'

export const SCENE_COMPONENT_PORTAL_COLLIDER_VALUES = {
  bodyType: RigidBodyType.Fixed,
  shapeType: ShapeType.Cuboid,
  isTrigger: true,
  removeMesh: true,
  collisionLayer: CollisionGroups.Trigger,
  collisionMask: CollisionGroups.Avatars,
  target: '',
  onEnter: 'teleport'
}

export const PortalComponent = defineComponent({
  name: 'PortalComponent',

  onInit: (entity) => {
    setCallback(entity, 'teleport', portalTriggerEnter)

    if (!hasComponent(entity, ColliderComponent))
      addComponent(entity, ColliderComponent, { ...SCENE_COMPONENT_PORTAL_COLLIDER_VALUES })
    return {
      linkedPortalId: '',
      location: '',
      effectType: 'None',
      previewType: PortalPreviewTypeSimple as string,
      previewImageURL: '',
      redirect: false,
      spawnPosition: new Vector3(),
      spawnRotation: new Quaternion(),
      remoteSpawnPosition: new Vector3(),
      remoteSpawnRotation: new Quaternion(),
      mesh: null as Mesh<SphereGeometry, MeshBasicMaterial> | null,
      helper: null as Mesh<CylinderGeometry, MeshBasicMaterial> | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.string.test(json.linkedPortalId)) component.linkedPortalId.set(json.linkedPortalId)
    if (matches.string.test(json.location)) component.location.set(json.location)
    if (matches.string.test(json.effectType)) component.effectType.set(json.effectType)
    if (matches.string.test(json.previewType)) component.previewType.set(json.previewType)
    if (matches.string.test(json.previewImageURL)) component.previewImageURL.set(json.previewImageURL)
    if (matches.boolean.test(json.redirect)) component.redirect.set(json.redirect)
    if (matches.object.test(json.spawnPosition)) component.spawnPosition.value.copy(json.spawnPosition)
    if (matches.object.test(json.spawnRotation)) {
      if (json.spawnRotation.w) component.spawnRotation.value.copy(json.spawnRotation)
      // backwards compat
      else
        component.spawnRotation.value.copy(
          new Quaternion().setFromEuler(new Euler().setFromVector3(json.spawnRotation as any))
        )
    }
  },

  toJSON: (entity, component) => {
    return {
      location: component.location.value,
      linkedPortalId: component.linkedPortalId.value,
      redirect: component.redirect.value,
      effectType: component.effectType.value,
      previewType: component.previewType.value,
      previewImageURL: component.previewImageURL.value,
      spawnPosition: component.spawnPosition.value,
      spawnRotation: component.spawnRotation.value
    }
  },

  onRemove: (entity, component) => {
    if (component.mesh.value) removeObjectFromGroup(entity, component.mesh.value)
    if (component.helper.value) removeObjectFromGroup(entity, component.helper.value)
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, PortalComponent)) throw root.stop()

    const debugEnabled = useHookstate(getState(RendererState).nodeHelperVisibility)
    const portalComponent = useComponent(root.entity, PortalComponent)

    useEffect(() => {
      if (debugEnabled.value && !portalComponent.helper.value) {
        const helper = new Mesh(
          new CylinderGeometry(0.25, 0.25, 0.1, 6, 1, false, (30 * Math.PI) / 180),
          new MeshBasicMaterial({ color: 0x2b59c3 })
        )
        helper.name = `portal-helper-${root.entity}`

        const spawnDirection = new Mesh(
          new ConeGeometry(0.05, 0.5, 4, 1, false, Math.PI / 4),
          new MeshBasicMaterial({ color: 0xd36582 })
        )
        spawnDirection.position.set(0, 0, 1.25)
        spawnDirection.rotateX(Math.PI / 2)
        helper.add(spawnDirection)

        setObjectLayers(helper, ObjectLayers.NodeHelper)
        addObjectToGroup(root.entity, helper)

        portalComponent.helper.set(helper)
      }

      if (!debugEnabled.value && portalComponent.helper.value) {
        removeObjectFromGroup(root.entity, portalComponent.helper.value)
        portalComponent.helper.set(none)
      }
    }, [debugEnabled])

    useEffect(() => {
      if (portalComponent.mesh.value && portalComponent.previewType.value === PortalPreviewTypeSimple) {
        removeObjectFromGroup(root.entity, portalComponent.mesh.value)
        portalComponent.mesh.set(null)
      }

      if (!portalComponent.mesh.value && portalComponent.previewType.value === PortalPreviewTypeSpherical) {
        const portalMesh = new Mesh(new SphereGeometry(1.5, 32, 32), new MeshBasicMaterial({ side: BackSide }))
        portalMesh.scale.x = -1
        portalComponent.mesh.set(portalMesh)
        addObjectToGroup(root.entity, portalMesh)
      }
    }, [portalComponent.previewType])

    return null
  }
})
