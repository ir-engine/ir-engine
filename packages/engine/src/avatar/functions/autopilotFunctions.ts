import _ from 'lodash'
import { CylinderGeometry, Material, Mesh, MeshBasicMaterial, Object3D, Quaternion, Scene } from 'three'
import { Vector3 } from 'three'

import { V_010 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { AvatarAnimationComponentType } from '../components/AvatarAnimationComponent'
import { AvatarControllerComponent, AvatarControllerComponentType } from '../components/AvatarControllerComponent'

const interactionGroups = getInteractionGroups(
  CollisionGroups.Avatars,
  CollisionGroups.Ground | CollisionGroups.Default
)
const raycastArgs = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 250,
  groups: interactionGroups
} as RaycastArgs

export const autopilotSetPosition = (entity: Entity) => {
  const physicsWorld = Engine.instance.currentWorld.physicsWorld
  const world = Engine.instance.currentWorld

  const castedRay = Physics.castRayFromCamera(world.camera, world.pointerState.position, physicsWorld, raycastArgs)
  const rayNormal = new Vector3(castedRay[0].normal.x, castedRay[0].normal.y, castedRay[0].normal.z)
  if (!castedRay.length || !assessWalkability(entity, rayNormal)) return undefined

  const avatarControllerComponent = getComponent(entity, AvatarControllerComponent)
  const autopilotPosition = castedRay[0].position
  avatarControllerComponent.autopilotWalkpoint = autopilotPosition as Vector3

  placeMarker(avatarControllerComponent, rayNormal)
}

const makeMarkerObject = (): Object3D => {
  const markerGeometry = new CylinderGeometry(0.175, 0.175, 0.025, 24, 1)
  const material = new MeshBasicMaterial({ color: '#00E14E' })
  const markerObject = new Mesh(markerGeometry, material)
  const currentScene = Engine.instance.currentWorld.scene
  currentScene.add(markerObject)
  return markerObject
}

const markerObject = makeMarkerObject()

export async function placeMarker(controller: AvatarControllerComponentType, rayNormal: Vector3) {
  if (!controller.autopilotWalkpoint) return
  markerObject.visible = true
  markerObject.position.set(
    controller.autopilotWalkpoint.x,
    controller.autopilotWalkpoint.y,
    controller.autopilotWalkpoint.z
  )
  const newRotation = new Quaternion().setFromUnitVectors(V_010, rayNormal)
  markerObject.rotation.setFromQuaternion(newRotation)
  markerObject.updateMatrixWorld()

  const waitForAutopilot = () => {
    const reached = (resolve) => {
      if (!controller.autopilotWalkpoint) resolve()
      else setTimeout((_) => reached(resolve), 250)
    }
    return new Promise(reached)
  }

  await waitForAutopilot()

  markerObject.visible = false
}

const minDot = 0.45
export const assessWalkability = (entity: Entity, rayNormal: Vector3): boolean => {
  const flatEnough = rayNormal.dot(V_010) > minDot
  return flatEnough
}
