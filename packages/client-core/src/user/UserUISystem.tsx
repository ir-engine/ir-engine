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

import React, { useEffect } from 'react'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState } from '@ir-engine/hyperflux'

import { useHookstate } from '@hookstate/core'
import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { EngineState, QueryReactor, useEntityContext, useOptionalComponent } from '@ir-engine/ecs'
import { IFrameComponent } from '@ir-engine/engine/src/scene/components/IFrameComponent'
import { NetworkState } from '@ir-engine/network'
import { PopoverState } from '../common/services/PopoverState'
import { InviteService } from '../social/services/InviteService'
import { ViewerMenuState } from '../util/ViewerMenuState'
import EmbedFrame from './menus/avatar/EmbedFrame'

const IFrameReactor = () => {
  const entity = useEntityContext()
  const iframeComponent = useOptionalComponent(entity, IFrameComponent)

  useEffect(() => {
    if (iframeComponent?.isOpen.value) {
      PopoverState.showPopupover(<EmbedFrame src={iframeComponent?.src.value} />)
    }
  }, [iframeComponent])

  return null
}

const UserSystemReactor = () => {
  InviteService.useAPIListeners()

  const [emotesEnabled, avaturnEnabled, rpmEnabled, socialsEnabled] = useFeatureFlags([
    FeatureFlags.Client.Menu.Emote,
    FeatureFlags.Client.Menu.Avaturn,
    FeatureFlags.Client.Menu.ReadyPlayerMe,
    FeatureFlags.Client.Menu.Social
  ])

  const worldHostId = useHookstate(getMutableState(NetworkState).hostIds.world).value

  useEffect(() => {
    if (!emotesEnabled) return

    const viewerUserMenuState = getMutableState(ViewerMenuState).userMenus
    viewerUserMenuState.merge({
      emote: true
    })
    return () =>
      viewerUserMenuState.merge({
        emote: false
      })
  }, [emotesEnabled])

  useEffect(() => {
    if (!avaturnEnabled) return

    const viewerUserMenuState = getMutableState(ViewerMenuState).userMenus
    viewerUserMenuState.merge({
      avaturn: true
    })
    return () =>
      viewerUserMenuState.merge({
        avaturn: false
      })
  }, [avaturnEnabled])

  useEffect(() => {
    if (!rpmEnabled) return

    const viewerUserMenuState = getMutableState(ViewerMenuState).userMenus
    viewerUserMenuState.merge({
      readyplayer: true
    })
    return () =>
      viewerUserMenuState.merge({
        readyplayer: false
      })
  }, [rpmEnabled])

  useEffect(() => {
    if (!socialsEnabled) return

    const viewerUserMenuState = getMutableState(ViewerMenuState).userMenus
    viewerUserMenuState.merge({
      social: true
    })
    return () =>
      viewerUserMenuState.merge({
        social: false
      })
  }, [socialsEnabled])

  useEffect(() => {
    const viewerUserMenuState = getMutableState(ViewerMenuState).userMenus
    viewerUserMenuState.merge({
      share: true
    })
    return () =>
      viewerUserMenuState.merge({
        share: false
      })
  }, [worldHostId])

  return <QueryReactor Components={[IFrameComponent]} ChildEntityReactor={IFrameReactor} />
}

export const UserUISystem = defineSystem({
  uuid: 'ee.client.UserUISystem2',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const userID = useHookstate(getMutableState(EngineState)).userID.value
    if (!userID) return null

    return <UserSystemReactor />
  }
})
