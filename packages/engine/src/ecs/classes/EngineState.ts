import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { defineAction, defineState, getState, useState } from '@xrengine/hyperflux'

import { ParityValue } from '../../common/enums/ParityValue'
import { matches, matchesEntity, matchesUserId, Validator } from '../../common/functions/MatchesUtils'
import { Entity } from './Entity'

// TODO: #6016 Refactor EngineState into multiple state objects: timer, scene, world, xr, etc.
export const EngineState = defineState({
  name: 'EngineState',
  initial: {
    frameTime: 0,
    deltaSeconds: 0,
    elapsedSeconds: 0,
    fixedDeltaSeconds: 1 / 60,
    fixedElapsedSeconds: 0,
    fixedTick: 0,
    isEngineInitialized: false,
    sceneLoaded: false,
    joinedWorld: false,
    loadingProgress: 0,
    connectedWorld: false,
    isTeleporting: false,
    leaveWorld: false,
    socketInstance: false,
    avatarTappedId: '' as UserId,
    userHasInteracted: false,
    spectating: false,
    errorEntities: {} as { [key: Entity]: boolean },
    usersTyping: {} as { [key: string]: true },
    /**
     * An empty share link will default to the current URL, plus any modifiers (such as spectate mode)
     */
    shareLink: '',
    shareTitle: '',
    transformsNeedSorting: true,
    useSimpleMaterials: false
  }
})

export function EngineEventReceptor(a) {
  const s = getState(EngineState)
  matches(a)
    .when(EngineActions.browserNotSupported.matches, (action) => {})
    .when(EngineActions.resetEngine.matches, (action) =>
      s.merge({
        socketInstance: action.instance
      })
    )
    .when(EngineActions.userAvatarTapped.matches, (action) =>
      s.merge({
        avatarTappedId: action.userId
      })
    )
    .when(EngineActions.initializeEngine.matches, (action) => s.merge({ isEngineInitialized: action.initialised }))
    .when(EngineActions.sceneUnloaded.matches, (action) => s.merge({ sceneLoaded: false }))
    .when(EngineActions.sceneLoaded.matches, (action) => s.merge({ sceneLoaded: true, loadingProgress: 100 }))
    .when(EngineActions.joinedWorld.matches, (action) => s.merge({ joinedWorld: true }))
    .when(EngineActions.leaveWorld.matches, (action) => s.merge({ joinedWorld: false }))
    .when(EngineActions.sceneLoadingProgress.matches, (action) => s.merge({ loadingProgress: action.progress }))
    .when(EngineActions.connectToWorld.matches, (action) => s.merge({ connectedWorld: action.connectedWorld }))
    .when(EngineActions.setTeleporting.matches, (action) => s.merge({ isTeleporting: action.isTeleporting }))
    .when(EngineActions.setUserHasInteracted.matches, (action) => s.merge({ userHasInteracted: true }))
    .when(EngineActions.updateEntityError.matches, (action) => s.errorEntities[action.entity].set(!action.isResolved))
    .when(EngineActions.spectateUser.matches, (action) => s.spectating.set(!!action.user))
    .when(EngineActions.shareInteractableLink.matches, (action) => {
      s.shareLink.set(action.shareLink)
      s.shareTitle.set(action.shareTitle)
    })
    .when(EngineActions.useSimpleMaterials.matches, (action) => {
      s.useSimpleMaterials.set(action.useSimpleMaterials)
    })
}

export const getEngineState = () => getState(EngineState)

export const useEngineState = () => useState(getEngineState())

export class EngineActions {
  static userAvatarTapped = defineAction({
    type: 'xre.engine.USER_AVATAR_TAPPED' as const,
    userId: matchesUserId
  })

  static setTeleporting = defineAction({
    type: 'xre.engine.SET_TELEPORTING' as const,
    isTeleporting: matches.boolean
  })

  static resetEngine = defineAction({
    type: 'xre.engine.RESET_ENGINE' as const,
    instance: matches.boolean
  })

  static initializeEngine = defineAction({
    type: 'xre.engine.INITIALIZED_ENGINE' as const,
    initialised: matches.boolean
  })

  static connectToWorld = defineAction({
    type: 'xre.engine.CONNECT_TO_WORLD' as const,
    connectedWorld: matches.boolean
  })

  static joinedWorld = defineAction({
    type: 'xre.engine.JOINED_WORLD' as const
  })

  static leaveWorld = defineAction({
    type: 'xre.engine.LEAVE_WORLD' as const
  })

  static sceneLoaded = defineAction({
    type: 'xre.engine.SCENE_LOADED' as const
  })

  static sceneUnloaded = defineAction({
    type: 'xre.engine.SCENE_UNLOADED' as const
  })

  static sceneLoadingProgress = defineAction({
    type: 'xre.engine.SCENE_LOADING_PROGRESS' as const,
    progress: matches.number
  })

  static connect = defineAction({
    type: 'xre.engine.CONNECT' as const,
    id: matches.string
  })

  static browserNotSupported = defineAction({
    type: 'xre.engine.BROWSER_NOT_SUPPORTED' as const,
    msg: matches.string
  })

  static setUserHasInteracted = defineAction({
    type: 'xre.engine.SET_USER_HAS_INTERACTED' as const
  })

  static updateEntityError = defineAction({
    type: 'xre.engine.ENTITY_ERROR_UPDATE' as const,
    entity: matches.number as Validator<unknown, Entity>,
    isResolved: matches.boolean.optional()
  })

  static setupAnimation = defineAction({
    type: 'xre.engine.SETUP_ANIMATION' as const,
    entity: matches.number
  })

  static spectateUser = defineAction({
    type: 'xre.engine.SPECTATE_USER' as const,
    user: matches.string.optional()
  })

  static shareInteractableLink = defineAction({
    type: 'xre.engine.SHARE_LINK' as const,
    shareLink: matches.string,
    shareTitle: matches.string
  })

  static interactedWithObject = defineAction({
    type: 'xre.engine.INTERACTED_WITH_OBJECT' as const,
    targetEntity: matchesEntity.optional(),
    parityValue: matches.string as Validator<unknown, typeof ParityValue[keyof typeof ParityValue]>
  })

  /**
   * Dispatched whenever an otherwise unchanging scene object has it's properties changed,
   *   such as making changes from the editor.
   **/
  static sceneObjectUpdate = defineAction({
    type: 'xre.engine.SCENE_OBJECT_UPDATE' as const,
    entities: matches.array as Validator<unknown, Entity[]>
  })

  static useSimpleMaterials = defineAction({
    type: 'xre.engine.SIMPLE_MATERIALS' as const,
    useSimpleMaterials: matches.boolean
  })
}
