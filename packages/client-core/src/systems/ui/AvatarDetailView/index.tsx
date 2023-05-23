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
