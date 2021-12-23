import {
  BoxBufferGeometry,
  BufferGeometry,
  Color,
  Euler,
  ExtrudeGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PlaneBufferGeometry,
  Quaternion,
  Vector3
} from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { FontManager } from '../../xrui/classes/FontManager'
import { Object3DComponent } from '../components/Object3DComponent'
import { PortalComponent } from '../components/PortalComponent'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { BodyType } from '../../physics/types/PhysicsTypes'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'

export type PortalProps = {
  locationName: string
  linkedPortalId: string
  modelUrl: string
  displayText: string
  triggerPosition: Vector3
  triggerRotation: Euler
  triggerScale: Vector3
}

const vec3 = new Vector3()

export const createPortal = async (entity: Entity, args: PortalProps) => {
  // console.log(args)
  const { locationName, linkedPortalId, displayText, triggerPosition, triggerRotation, triggerScale } = args

  const transform = getComponent(entity, TransformComponent)

  let previewMesh: Mesh

  previewMesh = new Mesh(new BoxBufferGeometry(), new MeshPhongMaterial({ color: new Color('white') }))
  previewMesh.geometry.scale(triggerScale.x, triggerScale.y, triggerScale.z)
  previewMesh.geometry.applyQuaternion(
    new Quaternion().setFromEuler(new Euler(triggerRotation.x, triggerRotation.y, triggerRotation.z))
  )
  previewMesh.geometry.translate(triggerPosition.x, triggerPosition.y, triggerPosition.z)

  // TODO: add bpcem stencil. until now, keep preview mesh hidden
  // addComponent(entity, Object3DComponent, { value: previewMesh })

  const world = useWorld()

  const portalShape = world.physics.createShape(
    new PhysX.PxBoxGeometry(triggerScale.x * 0.5, triggerScale.y * 0.5, triggerScale.z * 0.5),
    world.physics.createMaterial(),
    {
      isTrigger: true,
      collisionLayer: CollisionGroups.Trigger,
      collisionMask: CollisionGroups.Trigger
    }
  )

  portalShape.setLocalPose({
    translation: new Vector3(triggerPosition.x, triggerPosition.y, triggerPosition.z),
    rotation: new Quaternion().setFromEuler(new Euler(triggerRotation.x, triggerRotation.y, triggerRotation.z))
  })

  const portalBody = world.physics.addBody({
    shapes: [portalShape],
    type: BodyType.STATIC,
    transform: {
      translation: transform.position,
      rotation: transform.rotation
    },
    userData: { entity }
  })

  addComponent(entity, ColliderComponent, { body: portalBody })
  addComponent(entity, CollisionComponent, { collisions: [] })

  addComponent(entity, PortalComponent, {
    location: locationName,
    linkedPortalId,
    displayText,
    previewMesh,
    isPlayerInPortal: false,
    remoteSpawnPosition: new Vector3(),
    remoteSpawnRotation: new Quaternion(),
    remoteSpawnEuler: new Euler()
  })

  addComponent(entity, TriggerVolumeComponent, {
    args: null,
    target: null,
    active: true
  })
}

export const setRemoteLocationDetail = (
  portal: ReturnType<typeof PortalComponent.get>,
  spawnPosition: Vector3,
  spawnRotation: Euler
): void => {
  portal.remoteSpawnPosition = new Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z)
  portal.remoteSpawnEuler = new Euler(spawnRotation.x, spawnRotation.y, spawnRotation.z, 'XYZ')
  portal.remoteSpawnRotation = new Quaternion().setFromEuler(portal.remoteSpawnEuler)
}
