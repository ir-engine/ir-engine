import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { PortalComponent, PortalComponentType } from '../../components/PortalComponent'
import {
  BoxBufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3
} from 'three'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_PORTAL = 'portal'
export const SCENE_COMPONENT_PORTAL_DEFAULT_VALUES = {
  linkedPortalId: '',
  locationName: '',
  triggerPosition: new Vector3(),
  triggerRotation: new Euler(),
  triggerScale: new Vector3(1, 1, 1)
} as Partial<PortalComponentType>

export const deserializePortal: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<PortalComponentType>
): void => {
  addComponent(entity, PortalComponent, {
    location: json.props.location,
    linkedPortalId: json.props.linkedPortalId,
    displayText: json.props.displayText,
    helper: null!,
    isPlayerInPortal: false,
    remoteSpawnPosition: new Vector3(),
    remoteSpawnRotation: new Quaternion(),
    remoteSpawnEuler: new Euler()
  })

  if (Engine.isEditor) {
    const spawnHelperEntity = createEntity()
    const portalComponent = getComponent(entity, PortalComponent)
    portalComponent.helper = spawnHelperEntity
    addComponent(spawnHelperEntity, TransformComponent, {
      position: new Vector3(),
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1)
    })
    const spawnHelperMesh = new Mesh(
      new CylinderGeometry(1, 1, 0.3, 6, 1, false, (30 * Math.PI) / 180),
      new MeshBasicMaterial({ color: 0x2b59c3 })
    )
    const spawnDirection = new Mesh(
      new ConeGeometry(0.15, 0.5, 4, 1, false, Math.PI / 4),
      new MeshBasicMaterial({ color: 0xd36582 })
    )
    spawnDirection.position.set(0, 0, 1.25)
    spawnDirection.rotateX(Math.PI / 2)
    spawnHelperMesh.add(spawnDirection)

    addComponent(spawnHelperEntity, Object3DComponent, { value: spawnHelperMesh })

    // TODO: this will be unnecessary when the trigger volume node is converted to ECS
    const triggerMesh = new Mesh(
      new BoxBufferGeometry(1, 1, 0.2),
      new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.25 })
    )
    addComponent(entity, Object3DComponent, { value: triggerMesh })
  }

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PORTAL)
}

export const updatePortal: ComponentUpdateFunction = (entity: Entity, prop: any) => {
  const portalComponent = getComponent(entity, PortalComponent)
  const helperTransform = getComponent(portalComponent.helper, TransformComponent)
  if (prop.spawnPosition) {
    helperTransform.position.set(prop.spawnPosition.x || 0, prop.spawnPosition.y || 0, prop.spawnPosition.z || 0)
  }
  if (prop.spawnRotation) {
    const euler = new Euler().setFromQuaternion(helperTransform.rotation)
    euler.x = prop.spawnRotation.x ?? euler.x
    euler.y = prop.spawnRotation.y ?? euler.y
    euler.z = prop.spawnRotation.z ?? euler.z
    helperTransform.rotation.setFromEuler(euler)
  }
}

export const serializePortal: ComponentSerializeFunction = (entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  if (!portalComponent) return
  const helperEntity = portalComponent.helper
  const helperTransform = getComponent(helperEntity, TransformComponent)

  return {
    name: SCENE_COMPONENT_PORTAL,
    props: {
      location: portalComponent.location,
      linkedPortalId: portalComponent.linkedPortalId,
      // cubemapBakeId: component.cubemapBakeId, // TODO
      spawnPosition: helperTransform.position,
      spawnRotation: new Euler().setFromQuaternion(helperTransform.rotation).toVector3()
    }
  }
}
