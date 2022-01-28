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
import { ConeGeometry, CylinderGeometry, Euler, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'
import { setObjectLayers } from '../setObjectLayers'
import { ObjectLayers } from '../../constants/ObjectLayers'

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

    setObjectLayers(spawnHelperMesh, ObjectLayers.NodeHelper)
    addComponent(spawnHelperEntity, Object3DComponent, { value: spawnHelperMesh })
  }

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PORTAL)
}

export const updatePortal: ComponentUpdateFunction = (entity: Entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  const helperTransform = getComponent(portalComponent.helper, TransformComponent)
  if (portalComponent.spawnPosition) {
    helperTransform.position.set(
      portalComponent.spawnPosition.x || 0,
      portalComponent.spawnPosition.y || 0,
      portalComponent.spawnPosition.z || 0
    )
  }
  if (portalComponent.spawnRotation) {
    const euler = new Euler().setFromQuaternion(helperTransform.rotation)
    euler.x = portalComponent.spawnRotation.x ?? euler.x
    euler.y = portalComponent.spawnRotation.y ?? euler.y
    euler.z = portalComponent.spawnRotation.z ?? euler.z
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
