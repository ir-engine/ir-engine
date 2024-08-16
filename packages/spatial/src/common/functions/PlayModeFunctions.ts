import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { Engine, UUIDComponent, getComponent, removeComponent, removeEntity } from '@etherealengine/ecs'
import { TransformGizmoControlledComponent } from '@etherealengine/editor/src/classes/TransformGizmoControlledComponent'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { transformGizmoControlledQuery } from '@etherealengine/editor/src/systems/GizmoSystem'
import { VisualScriptActions, visualScriptQuery } from '@etherealengine/engine'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { getRandomSpawnPoint } from '@etherealengine/engine/src/avatar/functions/getSpawnPoint'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/avatar/functions/receiveJoinWorld'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { WorldNetworkAction } from '@etherealengine/network'
import { EngineState } from '../../EngineState'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '../../camera/components/TargetCameraRotationComponent'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'

/**
 * Returns true if we stopped play mode, false if we were not in play mode
 */
export const tryStopPlayMode = (): boolean => {
  const entity = AvatarComponent.getSelfAvatarEntity()
  if (entity) {
    dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID: getComponent(entity, UUIDComponent) }))
    removeEntity(entity)
    const viewerEntity = getState(EngineState).viewerEntity
    removeComponent(viewerEntity, ComputedTransformComponent)
    removeComponent(viewerEntity, FollowCameraComponent)
    removeComponent(viewerEntity, TargetCameraRotationComponent)
    getMutableState(EngineState).isEditing.set(true)
    visualScriptQuery().forEach((entity) => dispatchAction(VisualScriptActions.stop({ entity })))
    // stop all visual script logic
  }
  return !!entity
}

export const startPlayMode = () => {
  const authState = getState(AuthState)
  // const authState = useHookstate(getMutableState(AuthState))
  const avatarDetails = authState.user.avatar //.value

  const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userID)
  const currentScene = getComponent(getState(EditorState).rootEntity, UUIDComponent)

  if (avatarDetails)
    spawnLocalAvatarInWorld({
      parentUUID: currentScene,
      avatarSpawnPose,
      avatarID: avatarDetails.id!,
      name: authState.user.name //.value
    })

  // todo
  getMutableState(EngineState).isEditing.set(false)
  // run all visual script logic
  visualScriptQuery().forEach((entity) => dispatchAction(VisualScriptActions.execute({ entity })))
  transformGizmoControlledQuery().forEach((entity) => removeComponent(entity, TransformGizmoControlledComponent))
  //just remove all gizmo in the scene
}
