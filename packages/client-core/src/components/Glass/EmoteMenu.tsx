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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { UUIDComponent } from '@ir-engine/ecs'
import { emoteAnimations, preloadedAnimations } from '@ir-engine/engine/src/avatar/animation/Util'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { dispatchAction } from '@ir-engine/hyperflux'
import React from 'react'
import { MenuIconButton } from './buttons/MenuIconButton'
import CabbagePatch from './icons/CabbagePatch'
import ClapHands from './icons/ClapHands'
import Macarena from './icons/Macarena'
import RunningMan from './icons/RunningMan'
import TwistAndShout from './icons/TwistAndShout'
import WaveHand from './icons/WaveHand'

const icons = [
  {
    Icon: ClapHands,
    stateName: 'clap',
    description: 'Clap Hands'
  },

  {
    Icon: WaveHand,
    stateName: 'wave',
    description: 'Wave hand'
  },

  {
    Icon: RunningMan,
    stateName: 'dance4',
    description: 'Dances - Running Man'
  },

  {
    Icon: CabbagePatch,
    stateName: 'dance1',
    description: 'Dances - Cabbage Patch'
  },

  {
    Icon: TwistAndShout,
    stateName: 'dance3',
    description: 'Dances - Twist and Shout Dance'
  },

  {
    Icon: Macarena,
    stateName: 'dance2',
    description: 'Dances - Macarena'
  }
]

export function EmoteMenu() {
  const playAnimation = (stateName: string) => {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    dispatchAction(
      AvatarNetworkAction.setAnimationState({
        animationAsset: preloadedAnimations.emotes,
        clipName: stateName,
        loop: false,
        layer: 0,
        entityUUID: UUIDComponent.get(selfAvatarEntity)
      })
    )
  }

  return (
    <>
      {icons.map(({ Icon, stateName }, index) => {
        return (
          <MenuIconButton
            key={index}
            onClick={() => {
              playAnimation(emoteAnimations[stateName])
            }}
          >
            <Icon />
          </MenuIconButton>
        )
      })}
    </>
  )
}
