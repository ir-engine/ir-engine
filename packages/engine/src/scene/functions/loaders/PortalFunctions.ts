import { ConeGeometry, CylinderGeometry, Euler, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import {
  addTransformOffsetComponent,
  TransformOffsetComponent
} from '../../../transform/components/TransformOffsetComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { NameComponent } from '../../components/NameComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PortalComponent, PortalComponentType } from '../../components/PortalComponent'
import { VisibleComponent } from '../../components/VisibleComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { setObjectLayers } from '../setObjectLayers'

export const SCENE_COMPONENT_PORTAL = 'portal'
export const SCENE_COMPONENT_PORTAL_DEFAULT_VALUES = {
  linkedPortalId: '',
  location: '',
  isPlayerInPortal: false,
  helper: null!,
  redirect: false,
  spawnPosition: new Vector3(),
  spawnRotation: new Quaternion(),
  remoteSpawnPosition: new Vector3(),
  remoteSpawnRotation: new Quaternion(),
  remoteSpawnEuler: new Euler()
} as PortalComponentType

export const deserializePortal: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<PortalComponentType>
): void => {
  const props = parsePortalProperties(json.props)

  const portalComponent = addComponent(entity, PortalComponent, props)

  const spawnHelperEntity = createEntity()
  portalComponent.helper = spawnHelperEntity

  addComponent(spawnHelperEntity, TransformComponent, {
    position: props.spawnPosition,
    rotation: props.spawnRotation,
    scale: new Vector3(1, 1, 1)
  })
  const spawnHelperMesh = new Mesh(
    new CylinderGeometry(0.25, 0.25, 0.1, 6, 1, false, (30 * Math.PI) / 180),
    new MeshBasicMaterial({ color: 0x2b59c3 })
  )
  const spawnDirection = new Mesh(
    new ConeGeometry(0.05, 0.5, 4, 1, false, Math.PI / 4),
    new MeshBasicMaterial({ color: 0xd36582 })
  )
  spawnDirection.position.set(0, 0, 1.25)
  spawnDirection.rotateX(Math.PI / 2)
  spawnHelperMesh.add(spawnDirection)
  spawnHelperMesh.userData.isHelper = true

  setObjectLayers(spawnHelperMesh, ObjectLayers.NodeHelper)
  addComponent(spawnHelperEntity, Object3DComponent, { value: spawnHelperMesh })
  addComponent(spawnHelperEntity, VisibleComponent, true)
  addComponent(spawnHelperEntity, NameComponent, {
    name: 'portal helper - ' + getComponent(entity, NameComponent).name
  })

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PORTAL)

  updatePortal(entity)
}

export const updatePortal: ComponentUpdateFunction = (entity: Entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  const helperTransform = getComponent(portalComponent.helper, TransformComponent)
  helperTransform.position.copy(portalComponent.spawnPosition)
  helperTransform.rotation.copy(portalComponent.spawnRotation)
}

export const serializePortal: ComponentSerializeFunction = (entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  if (!portalComponent) return
  const helperTransform = getComponent(portalComponent.helper, TransformComponent)

  return {
    name: SCENE_COMPONENT_PORTAL,
    props: {
      location: portalComponent.location,
      linkedPortalId: portalComponent.linkedPortalId,
      redirect: portalComponent.redirect,
      // envMapBakeId: component.envMapBakeId, // TODO
      spawnPosition: helperTransform.position,
      spawnRotation: helperTransform.rotation
    }
  }
}

const parsePortalProperties = (props): PortalComponentType => {
  return {
    location: props.location ?? SCENE_COMPONENT_PORTAL_DEFAULT_VALUES.location,
    linkedPortalId: props.linkedPortalId ?? SCENE_COMPONENT_PORTAL_DEFAULT_VALUES.linkedPortalId,
    helper: null!,
    redirect: props.redirect ?? false,
    isPlayerInPortal: false,
    spawnPosition: new Vector3().copy(props.spawnPosition),
    spawnRotation: new Quaternion().setFromEuler(new Euler().setFromVector3(props.spawnRotation)),
    remoteSpawnPosition: new Vector3(),
    remoteSpawnRotation: new Quaternion(),
    remoteSpawnEuler: new Euler()
  }
}
