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
import { useEngine } from '../../ecs/classes/Engine'
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
  console.log(args)
  const { locationName, linkedPortalId, displayText, triggerPosition, triggerRotation, triggerScale } = args

  const transform = getComponent(entity, TransformComponent)

  let previewMesh: Mesh

  const hasModelUrl = Boolean(args.modelUrl && args.modelUrl !== '')

  if (hasModelUrl) {
    // this is also not a great idea, we should load this either as a static asset or from the portal node arguments
    const gltf = await AssetLoader.loadAsync({ url: args.modelUrl })

    const model = gltf.scene.clone()
    previewMesh = model.children[2] as Mesh
    const labelMesh = model.children[1] as Mesh

    model.position.copy(transform.position)
    model.quaternion.copy(transform.rotation)
    model.scale.copy(transform.scale)

    if (isClient) {
      FontManager.instance.getDefaultFont().then((font) => {
        const fontResolution = 120

        const createText = (text, scale) => {
          const exitTextShapes = font.generateShapes(text, fontResolution)
          const geometry = new ExtrudeGeometry(exitTextShapes, { bevelEnabled: false })
          const invResolution = scale / fontResolution
          geometry.scale(invResolution, invResolution * 0.8, 1 / fontResolution)
          geometry.computeBoundingBox()
          const xMid = -0.5 * (geometry.boundingBox?.max.x! - geometry.boundingBox?.min.x!)
          geometry.translate(xMid, 0, 1)
          return geometry
        }

        let geometry: BufferGeometry = createText('EXIT', 2.5)

        if (args.displayText && args.displayText !== '') {
          const displayTextGeom = createText(args.displayText, 1)
          displayTextGeom.translate(0, -1.6, 0)
          geometry = mergeBufferGeometries([geometry, displayTextGeom]) as BufferGeometry
        }

        const textSize = 0.15
        const text = new Mesh(geometry, new MeshBasicMaterial({ color: 0x000000 }))
        text.scale.setScalar(textSize)

        const textOtherSide = text.clone(true).rotateY(Math.PI)

        labelMesh.add(text)
        labelMesh.add(textOtherSide)
      })
    }

    addComponent(entity, Object3DComponent, { value: model })
  } else {
    previewMesh = new Mesh(new BoxBufferGeometry(), new MeshPhongMaterial({ color: new Color('white') }))
    previewMesh.geometry.scale(triggerScale.x, triggerScale.y, triggerScale.z)
    previewMesh.geometry.applyQuaternion(
      new Quaternion().setFromEuler(new Euler(triggerRotation.x, triggerRotation.y, triggerRotation.z))
    )
    previewMesh.geometry.translate(triggerPosition.x, triggerPosition.y, triggerPosition.z)

    // TODO: add bpcem stencil. until now, keep preview mesh hidden
    // addComponent(entity, Object3DComponent, { value: previewMesh })
  }

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

  useEngine().defaultWorld.portalEntities.push(entity)
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
