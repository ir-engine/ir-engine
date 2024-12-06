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

import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { respawnAvatar } from '@ir-engine/engine/src/avatar/functions/respawnAvatar'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { Button } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdAllOut, MdFormatColorReset, MdGridOn, MdPerson, MdRefresh, MdSelectAll, MdSquareFoot } from 'react-icons/md'

export default function DebugButtons() {
  const { t } = useTranslation()
  useHookstate(getMutableState(ECSState).frameTime).value
  const rendererState = useMutableState(RendererState)

  const onClickRespawn = (): void => {
    respawnAvatar(AvatarComponent.getSelfAvatarEntity())
  }

  const toggleDebug = () => {
    rendererState.physicsDebug.set(!rendererState.physicsDebug.value)
  }

  const toggleAvatarDebug = () => {
    rendererState.avatarDebug.set(!rendererState.avatarDebug.value)
  }

  const toggleNodeHelpers = () => {
    getMutableState(RendererState).nodeHelperVisibility.set(!getMutableState(RendererState).nodeHelperVisibility.value)
  }

  const toggleGridHelper = () => {
    getMutableState(RendererState).gridVisibility.set(!getMutableState(RendererState).gridVisibility.value)
  }

  return (
    <div className="m-1 rounded bg-neutral-600 p-1">
      <Text>{t('common:debug.debugOptions')}</Text>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={rendererState.physicsDebug.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.physicsDebug')}
          onClick={toggleDebug}
        >
          <MdSquareFoot />
        </Button>
        <Button
          size="sm"
          variant={rendererState.bvhDebug.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.bvhDebug')}
          onClick={() => rendererState.bvhDebug.set(!rendererState.bvhDebug.value)}
        >
          <MdAllOut />
        </Button>
        <Button
          size="sm"
          variant={rendererState.avatarDebug.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.avatarDebug')}
          onClick={toggleAvatarDebug}
        >
          <MdPerson />
        </Button>
        <Button
          size="sm"
          variant={rendererState.nodeHelperVisibility.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.nodeHelperDebug')}
          onClick={toggleNodeHelpers}
        >
          <MdSelectAll />
        </Button>
        <Button
          size="sm"
          variant={rendererState.gridVisibility.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.gridDebug')}
          onClick={toggleGridHelper}
        >
          <MdGridOn />
        </Button>
        <Button
          size="sm"
          variant={rendererState.forceBasicMaterials.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.forceBasicMaterials')}
          onClick={() => rendererState.forceBasicMaterials.set(!rendererState.forceBasicMaterials.value)}
        >
          <MdFormatColorReset />
        </Button>
        <Button size="sm" variant="tertiary" title={t('common:debug.respawn')} onClick={onClickRespawn}>
          <MdRefresh />
        </Button>
      </div>
    </div>
  )
}
