import { CylinderGeometry, Mesh, Object3D, Scene } from 'three'
import { Vector3 } from 'three'

import { V_010 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'

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
  if (!castedRay.length || !assessWalkability(entity, castedRay[0])) return undefined

  const autopilotPosition = castedRay[0].position
  addMarker(autopilotPosition as Vector3)
  getComponent(entity, AvatarControllerComponent).autopilotWalkpoint = autopilotPosition as Vector3
}

const markerGeometry = new CylinderGeometry(0.3, 0.3, 0.1, 32, 1)
var currentScene = Engine.instance.currentWorld.scene
const markerObject = new Mesh(markerGeometry)
currentScene.add(markerObject)
export async function addMarker(walkPoint: Vector3) {
  markerObject.visible = true
  markerObject.position.set(walkPoint.x, walkPoint.y, walkPoint.z)
  markerObject.updateMatrixWorld()

  //TO DO: Remove marker after awaiting distance < minimum distance
  // for now just wait 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log(markerObject)
  markerObject.visible = false
}

const minDot = 0.45
export const assessWalkability = (entity: Entity, castedRay: RaycastHit): boolean => {
  const normal = new Vector3(castedRay.normal.x, castedRay.normal.y, castedRay.normal.z)
  const flatEnough = normal.dot(V_010) > minDot
  return flatEnough
}
