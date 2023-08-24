import { defineAction } from '@etherealengine/hyperflux'
import matches from 'ts-matches'
import { matchesEntityUUID } from '../../common/functions/MatchesUtils'
import { NetworkTopics } from '../../networking/classes/Network'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { matchesIkTarget } from '../animation/Util'

export class AvatarNetworkAction {
  static spawn = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'avatar'
  })

  static setAnimationState = defineAction({
    type: 'ee.engine.avatar.SET_ANIMATION_STATE',
    entityUUID: matchesEntityUUID,
    animationState: matches.string,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static setAvatarID = defineAction({
    type: 'ee.engine.avatar.SET_AVATAR_ID',
    entityUUID: matchesEntityUUID,
    avatarID: matches.string,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static spawnIKTarget = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'ik-target',
    name: matchesIkTarget,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })
}
