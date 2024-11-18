/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs'
import { HyperFlux, UserID, applyIncomingActions, dispatchAction, getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { ArrowHelperComponent } from '@ir-engine/spatial/src/common/debug/ArrowHelperComponent'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { Physics, PhysicsWorld } from '@ir-engine/spatial/src/physics/classes/Physics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { act, render } from '@testing-library/react'
import React from 'react'
import { Quaternion, Vector3 } from 'three'
import { v4 } from 'uuid'
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { emoteAnimations } from '../../avatar/animation/Util'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { spawnAvatarReceptor } from '../../avatar/functions/spawnAvatarReceptor'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { AvatarState } from '../../avatar/state/AvatarNetworkState'
import { InteractableComponent } from '../../interaction/components/InteractableComponent'
import { MountPointActions, MountPointState } from '../../interaction/functions/MountPointActions'
import { MountPointComponent } from './MountPointComponent'
import { SittingComponent } from './SittingComponent'

describe('MountPointComponent.ts', async () => {
  let avatarTestEntity = UndefinedEntity
  let mountPointTestEntity = UndefinedEntity
  let sceneEntity: Entity

  beforeEach(async () => {
    createEngine()
    Engine.instance.store.userID = 'userId' as UserID
    initializeSpatialEngine()
    initializeSpatialViewer()
    avatarTestEntity = createEntity()
    mountPointTestEntity = createEntity()
    sceneEntity = loadEmptyScene()

    setComponent(sceneEntity, SceneComponent)
    setComponent(avatarTestEntity, UUIDComponent, Engine.instance.store.userID as string as EntityUUID)
    setComponent(mountPointTestEntity, UUIDComponent, v4() as EntityUUID)
    setComponent(mountPointTestEntity, TransformComponent)
    setComponent(mountPointTestEntity, InteractableComponent)
    setComponent(mountPointTestEntity, MountPointComponent)

    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: getComponent(avatarTestEntity, UUIDComponent),
        avatarURL: '',
        name: 'avatar1'
      })
    )

    applyIncomingActions()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('MountPointComponent', () => {
    it('Should set the MountPointComponent name to MountPointComponent', () => {
      assert.equal(MountPointComponent.name, 'MountPointComponent')
    })

    it('Should set the MountPointComponent jsonID to EE_mount_point', () => {
      assert.equal(MountPointComponent.jsonID, 'EE_mount_point')
    })

    it('Should set the mount point component initial data', () => {
      const customData = setComponent(mountPointTestEntity, MountPointComponent, {
        type: 'seat',
        dismountOffset: new Vector3(0, 0, 0.75),
        forceDismountPosition: true
      })
      const componentData = getComponent(mountPointTestEntity, MountPointComponent)
      assert.equal(componentData, customData)
    })
    describe('Reactor', () => {
      it('Should set mountEntity as callback to entity', () => {
        const callbackComponentArray = getComponent(mountPointTestEntity, CallbackComponent)
        const callbackComponent = 'mountEntity' in callbackComponentArray
        assert.equal(callbackComponent, true)
      })

      it('Should update the UI to show or hide an Interacteable component in the dropdown button based on wheter or not its mounted', async () => {
        MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
        applyIncomingActions()
        const { rerender, unmount } = render(<></>)
        await act(async () => rerender(MountPointComponent.reactor))
        // Github race condition
        await vi.waitFor(
          () => {
            expect(getComponent(mountPointTestEntity, InteractableComponent).uiVisibilityOverride).toBeTruthy()
          },
          { timeout: 10000 }
        )
        const mountPointPresent = getComponent(mountPointTestEntity, InteractableComponent).uiVisibilityOverride
        assert.equal(!!mountPointPresent, true)
        MountPointComponent.unmountEntity(avatarTestEntity)
        applyIncomingActions()
        await act(async () => rerender(MountPointComponent.reactor))
        // Github race condition
        await vi.waitFor(
          () => {
            expect(getComponent(mountPointTestEntity, InteractableComponent).uiVisibilityOverride).toBeFalsy()
          },
          { timeout: 10000 }
        )
        const mountPointNotPresent = getComponent(mountPointTestEntity, InteractableComponent).uiVisibilityOverride
        assert.equal(!!mountPointNotPresent, false)
      })

      it('Should add an arrow helper component if debug is enabled', () => {
        // Retrieve node helper visibility state from renderer state
        const debugFalse = getState(RendererState).nodeHelperVisibility
        const arrowComponent = getOptionalComponent(mountPointTestEntity, ArrowHelperComponent)
        assert.equal(!!arrowComponent, false)
        // Change it to true and check if the arrow component was added
        const debugTrue = debugFalse == true
        assert.equal(!!arrowComponent, debugTrue)
      })
    })
  })

  describe('mountEntity', () => {
    it('Should return if no avatarEntity', () => {
      MountPointComponent.mountEntity(UndefinedEntity, mountPointTestEntity)
      const actionDispatch = HyperFlux.store.actions.incoming.length
      assert.equal(actionDispatch, 0)
    })

    it('Should return if no mountPointEntity', () => {
      MountPointComponent.mountEntity(avatarTestEntity, UndefinedEntity)
      const actionDispatch = HyperFlux.store.actions.incoming.length
      assert.equal(actionDispatch, 0)
    })

    it('Should return if avatar not seated and point occupied by another entity', async () => {
      // Create a second avatar entity that occupies the mount location
      const avatarTestEntity2 = createEntity()
      setComponent(avatarTestEntity2, UUIDComponent, v4() as EntityUUID)
      dispatchAction(
        AvatarNetworkAction.spawn({
          parentUUID: getComponent(sceneEntity, UUIDComponent),
          position: new Vector3(),
          rotation: new Quaternion(),
          entityUUID: getComponent(avatarTestEntity2, UUIDComponent),
          avatarURL: '',
          name: 'avatar2'
        })
      )
      applyIncomingActions()
      const { rerender, unmount } = render(AvatarState.reactor)
      await act(async () => rerender(AvatarState.reactor))
      // Mount avatar test entity 2 first
      MountPointComponent.mountEntity(avatarTestEntity2, mountPointTestEntity)
      applyIncomingActions()
      // Try to mount avatar test entity
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      applyIncomingActions()
      const avatarSeated = getOptionalComponent(avatarTestEntity, SittingComponent)
      const seatOccupied = getState(MountPointState).mountsToMountedEntities
      assert.equal(!!avatarSeated, false)
      assert.equal(!!seatOccupied, true)
    })

    it('Should return if avatar already seated', () => {
      // Calling the function twice
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      const avatarSeated = getComponent(avatarTestEntity, SittingComponent)
      assert.equal(!!avatarSeated, true)
    })

    it('Should set the SittingComponent to avatarEntity and set mountPointEntity to the SittingComponent', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      const sittingComponent = getOptionalComponent(avatarTestEntity, SittingComponent)
      assert.equal(sittingComponent?.mountPointEntity, mountPointTestEntity)
    })

    it('Should capture the movement of the avatar controller component of avatarEntity', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      const component = getComponent(avatarTestEntity, AvatarControllerComponent)
      const componentMovementCaptured = component.movementCaptured.indexOf(mountPointTestEntity)
      assert.notEqual(componentMovementCaptured, -1)
    })

    it('Should dispatch an action to set the avatar animation state to sitting', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      const setAnimationState = HyperFlux.store.actions.incoming[0].type === AvatarNetworkAction.setAnimationState.type
      // Check if action is dispatched
      assert.equal(setAnimationState, true)

      const avatarSeated = HyperFlux.store.actions.incoming[0] as ReturnType<
        typeof AvatarNetworkAction.setAnimationState
      >
      const emoteSeated = emoteAnimations.seated
      // Check if dispatched action set values correctly
      assert.equal(avatarSeated.clipName, emoteSeated)
    })

    it('Should dispatch the mount interaction action with the mounted entity and the target mount', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      const avatarTestEntityUUID = getComponent(avatarTestEntity, UUIDComponent)
      const mountPointTestEntityUUID = getComponent(mountPointTestEntity, UUIDComponent)
      const setMountInteraction = HyperFlux.store.actions.incoming[1].type === MountPointActions.mountInteraction.type
      // Check if action is dispatched
      assert.equal(setMountInteraction, true)

      const mountPointAction = HyperFlux.store.actions.incoming[1] as ReturnType<
        typeof MountPointActions.mountInteraction
      >
      const mounted = mountPointAction.mounted
      const mountedEntity = mountPointAction.mountedEntity
      const targetMount = mountPointAction.targetMount
      // Check if dispatched action set values correctly
      assert.equal(mounted, true)
      assert.equal(mountedEntity, avatarTestEntityUUID)
      assert.equal(targetMount, mountPointTestEntityUUID)
    })
  })

  describe('unmountEntity', async () => {
    let physicsWorld = {} as PhysicsWorld
    let physicsWorldEntity = UndefinedEntity
    let avatarTestEntity = UndefinedEntity

    beforeEach(async () => {
      avatarTestEntity = createEntity()
      setComponent(avatarTestEntity, UUIDComponent, (Engine.instance.store.userID + '_avatar') as string as EntityUUID)
      spawnAvatarReceptor(Engine.instance.store.userID as string as EntityUUID)
      avatarTestEntity = AvatarComponent.getUserAvatarEntity(Engine.instance.store.userID)
      await Physics.load()
      physicsWorldEntity = createEntity()
      setComponent(physicsWorldEntity, EntityTreeComponent)
      setComponent(physicsWorldEntity, UUIDComponent, v4() as EntityUUID)
      setComponent(physicsWorldEntity, SceneComponent)
      setComponent(physicsWorldEntity, TransformComponent)
      const physicsWorldUUID = getComponent(physicsWorldEntity, UUIDComponent)
      physicsWorld = Physics.createWorld(physicsWorldUUID)
      physicsWorld.timestep = 1 / 60
      setComponent(avatarTestEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(mountPointTestEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(avatarTestEntity, SittingComponent, { mountPointEntity: mountPointTestEntity })
    })

    it('Should return early if avatarEntity has no sitting component', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      removeComponent(avatarTestEntity, SittingComponent)
      MountPointComponent.unmountEntity(avatarTestEntity)
      const actionDispatch = HyperFlux.store.actions.incoming.length
      assert.equal(actionDispatch, 0)
    })

    it('Should remove the looping of the seated animation', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      MountPointComponent.unmountEntity(avatarTestEntity)
      const actionDispatching = HyperFlux.store.actions.incoming[0].type === AvatarNetworkAction.setAnimationState.type
      // Check if action is dispatched
      assert.equal(actionDispatching, true)

      const dispatchedAction = HyperFlux.store.actions.incoming[0] as ReturnType<
        typeof AvatarNetworkAction.setAnimationState
      >
      const needsSkip = dispatchedAction.needsSkip
      // Check if dispatched action set values correctly
      assert.equal(needsSkip, true)
    })

    it('Should release avatarEntity movement', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      MountPointComponent.unmountEntity(avatarTestEntity)
      setComponent(avatarTestEntity, SittingComponent, { mountPointEntity: mountPointTestEntity })
      const component = getComponent(avatarTestEntity, AvatarControllerComponent)
      const componentMovementReleased = component.movementCaptured.indexOf(mountPointTestEntity)
      assert.equal(componentMovementReleased, -1)
    })

    it('Should dispatch action to unmount entity', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      MountPointComponent.unmountEntity(avatarTestEntity)
      setComponent(avatarTestEntity, SittingComponent, { mountPointEntity: mountPointTestEntity })
      const actionDispatching = HyperFlux.store.actions.incoming[1].type === MountPointActions.mountInteraction.type
      // Check if action is dispatched
      assert.equal(actionDispatching, true)

      const dispatchedAction = HyperFlux.store.actions.incoming[1] as ReturnType<
        typeof MountPointActions.mountInteraction
      >
      const mounted = dispatchedAction.mounted
      // Check if dispatched action set values correctly
      assert.equal(mounted, false)
    })

    it('Should not set the avatar position to the dismount position if no raycast hit and force dismount position is false', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      setComponent(avatarTestEntity, SittingComponent, { mountPointEntity: mountPointTestEntity })
      setComponent(mountPointTestEntity, MountPointComponent, {
        dismountOffset: new Vector3(1, 2, 3),
        forceDismountPosition: false
      })
      MountPointComponent.unmountEntity(avatarTestEntity)
      const avatarPosition = getComponent(avatarTestEntity, RigidBodyComponent).position
      const dismountPosition = getComponent(mountPointTestEntity, MountPointComponent).dismountOffset
      assert.notEqual(avatarPosition.x, dismountPosition.x)
      assert.notEqual(avatarPosition.y, dismountPosition.y)
      assert.notEqual(avatarPosition.z, dismountPosition.z)
    })

    it('Should set the avatar position to the dismount position if force dismount position is true', async () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      // Set force dismount to false
      setComponent(avatarTestEntity, SittingComponent, { mountPointEntity: mountPointTestEntity })
      setComponent(mountPointTestEntity, MountPointComponent, {
        dismountOffset: new Vector3(1, 2, 3),
        forceDismountPosition: false
      })
      MountPointComponent.unmountEntity(avatarTestEntity)
      const avatarPosition = getComponent(avatarTestEntity, RigidBodyComponent).position
      const dismountPosition = getComponent(mountPointTestEntity, MountPointComponent).dismountOffset
      // Check that the original avatar position is not the same as dismount position
      assert.notEqual(avatarPosition.x, dismountPosition.x)
      assert.notEqual(avatarPosition.y, dismountPosition.y)
      assert.notEqual(avatarPosition.z, dismountPosition.z)
      // Set the force dismount to true
      setComponent(mountPointTestEntity, MountPointComponent, {
        dismountOffset: new Vector3(1, 2, 3),
        forceDismountPosition: true
      })
      // Check the position has changed to dismountOffset
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      MountPointComponent.unmountEntity(avatarTestEntity)
      const avatarPositionChanged = getComponent(avatarTestEntity, RigidBodyComponent).position
      const dismountPosition2 = getComponent(mountPointTestEntity, MountPointComponent).dismountOffset
      assert.equal(avatarPositionChanged.x, dismountPosition2.x)
      assert.equal(avatarPositionChanged.y, dismountPosition2.y)
      assert.equal(avatarPositionChanged.z, dismountPosition2.z)
    })

    it('Should set the avatar position to dismount position if no force dismount and raycast hit', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      const groundPlaneEntity = createEntity()
      setComponent(groundPlaneEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(groundPlaneEntity, UUIDComponent, v4() as EntityUUID)
      setComponent(groundPlaneEntity, TransformComponent, {
        position: new Vector3(0, 1, 0),
        scale: new Vector3(10, 10, 10)
      })
      setComponent(groundPlaneEntity, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(groundPlaneEntity, ColliderComponent)
      setComponent(avatarTestEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(avatarTestEntity, SittingComponent, { mountPointEntity: mountPointTestEntity })
      setComponent(mountPointTestEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(mountPointTestEntity, MountPointComponent, {
        dismountOffset: new Vector3(1, 2, 3),
        forceDismountPosition: false
      })
      physicsWorld!.step()
      MountPointComponent.unmountEntity(avatarTestEntity)
      const avatarPositionChanged = getComponent(avatarTestEntity, RigidBodyComponent).position
      const dismountPosition = getComponent(mountPointTestEntity, MountPointComponent).dismountOffset
      assert.equal(avatarPositionChanged.x, dismountPosition.x)
      assert.equal(avatarPositionChanged.y, dismountPosition.y + 0.1)
      assert.equal(avatarPositionChanged.z, dismountPosition.z)
    })

    it('Should remove the sitting component from the avatar entity', () => {
      MountPointComponent.mountEntity(avatarTestEntity, mountPointTestEntity)
      setComponent(avatarTestEntity, SittingComponent, { mountPointEntity: mountPointTestEntity })
      setComponent(mountPointTestEntity, MountPointComponent, {
        dismountOffset: new Vector3(1, 2, 3),
        forceDismountPosition: true
      })
      const sittingComponentPresent = getOptionalComponent(avatarTestEntity, SittingComponent)
      MountPointComponent.unmountEntity(avatarTestEntity)
      const sittingComponentGone = getOptionalComponent(avatarTestEntity, SittingComponent)
      assert.notEqual(sittingComponentGone, sittingComponentPresent)
    })
  })
})
