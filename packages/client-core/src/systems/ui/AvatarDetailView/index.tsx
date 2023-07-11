/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'
import { CircleGeometry, Mesh, MeshBasicMaterial } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { addComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@etherealengine/engine/src/xrui/functions/useXRUIState'
import { createState, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import styleString from './index.scss?inline'

/** @deprecated */
export function createAvatarDetailView(id: string) {
  const videoPreviewMesh = new Mesh(new CircleGeometry(0.25, 32), new MeshBasicMaterial())
  const ui = createXRUI(
    AvatarDetailView,
    createState({
      id,
      videoPreviewMesh
    })
  )
  addComponent(ui.entity, NameComponent, 'avatar-detail-ui-' + id)
  return ui
}

interface AvatarDetailState {
  id: string
}
/** @deprecated */
const AvatarDetailView = () => {
  const { t } = useTranslation()
  const detailState = useXRUIState<AvatarDetailState>()
  const user = Array.from(Engine.instance.worldNetworkState.peers?.get({ noproxy: true }).values()).find(
    (peer) => peer.userId === detailState.id.value
  )
  const worldState = useHookstate(getMutableState(WorldState)).get({ noproxy: true })
  const engineState = useHookstate(getMutableState(EngineState))
  const usersTyping = engineState.usersTyping[detailState.id.value].value
  const username = worldState?.userNames && user ? worldState.userNames[user.userId] : 'A user'

  return (
    <>
      <link href="https://fonts.googleapis.com/css?family=Lato:400" rel="stylesheet" type="text/css" />
      <style>{styleString}</style>
      {user && (
        <div className="avatarName">
          {username}
          {usersTyping && <h6 className="typingIndicator">{t('common:typing')}</h6>}
        </div>
      )}
    </>
  )
}
