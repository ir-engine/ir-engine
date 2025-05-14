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

import React, { useEffect } from 'react'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState } from '@ir-engine/hyperflux'

import { useHookstate } from '@hookstate/core'
import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { EngineState, QueryReactor, setComponent, useEntityContext, useOptionalComponent } from '@ir-engine/ecs'
import { OverlayComponent } from '@ir-engine/engine/src/scene/components/OverlayComponent'
import { NetworkState } from '@ir-engine/network'
import { ModalState } from '../common/services/ModalState'
import { InviteService } from '../social/services/InviteService'
import { LoadingUISystemState } from '../systems/LoadingUISystem'
import { OverlayComponentState } from '../systems/OverlaySystem'
import { ViewerMenuState } from '../util/ViewerMenuState'

const OverlayReactor = () => {
  const entity = useEntityContext()
  const overlayComponent = useOptionalComponent(entity, OverlayComponent)
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  const onClose = () => {
    setComponent(entity, OverlayComponent, { isOpen: false })
    ModalState.closeModal()
    setIsPopoverOpen(false)
  }

  useEffect(() => {
    if (overlayComponent?.isOpen.value && !isPopoverOpen) {
      const popoverType = overlayComponent?.type.value
      if (!popoverType) return
      const Component = getState(OverlayComponentState)[popoverType]
      ModalState.openModal(<Component component={overlayComponent.value} onClose={onClose} />, () => {
        onClose()
      })
      setIsPopoverOpen(true)
    }
  }, [overlayComponent?.isOpen.value])

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

  return <QueryReactor Components={[OverlayComponent]} ChildEntityReactor={OverlayReactor} />
}

export const UserUISystem = defineSystem({
  uuid: 'ee.client.UserUISystem2',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const userID = useHookstate(getMutableState(EngineState)).userID.value
    const ready = useHookstate(getMutableState(LoadingUISystemState)).ready

    if (!userID || !ready.value) return null

    return <UserSystemReactor />
  }
})
