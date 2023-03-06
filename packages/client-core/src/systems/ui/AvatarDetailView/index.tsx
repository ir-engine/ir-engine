import { createState } from '@hookstate/core'
import { useState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CircleGeometry, Mesh, MeshBasicMaterial } from 'three'

import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { addComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@etherealengine/engine/src/xrui/functions/useXRUIState'

import { useNetworkUserState } from '../../../user/services/NetworkUserService'
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
  const userState = useNetworkUserState()
  const user = userState.layerUsers.find((user) => user.id.value === detailState.id.value)
  const engineState = useEngineState()
  const usersTyping = useState(engineState.usersTyping[detailState.id.value]).value

  return (
    <>
      <link href="https://fonts.googleapis.com/css?family=Lato:400" rel="stylesheet" type="text/css" />
      <style>{styleString}</style>
      {user && (
        <div className="avatarName">
          {user.name.value}
          {usersTyping && <h6 className="typingIndicator">{t('common:typing')}</h6>}
        </div>
      )}
    </>
  )
}
