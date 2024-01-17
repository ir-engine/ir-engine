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

import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import commonStyles from '@etherealengine/client-core/src/common/components/common.module.scss'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { resetAnimationLogic } from '@etherealengine/client-core/src/user/components/Panel3D/helperFunctions'
import { useRender3DPanelSystem } from '@etherealengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Tooltip from '@etherealengine/ui/src/primitives/mui/Tooltip'

import { SxProps, Theme } from '@mui/material/styles'

import styles from './index.module.scss'

import { defaultAnimationPath, preloadedAnimations } from '@etherealengine/engine/src/avatar/animation/Util'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ObjectLayerMaskComponent } from '@etherealengine/engine/src/scene/components/ObjectLayerComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
interface Props {
  fill?: boolean
  avatarUrl?: string
  sx?: SxProps<Theme>
  onAvatarError?: (error: string) => void
  onAvatarLoaded?: () => void
}

const AvatarPreview = ({ fill, avatarUrl, sx, onAvatarError, onAvatarLoaded }: Props) => {
  const { t } = useTranslation()
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>

  const [avatarLoading, setAvatarLoading] = useState(false)

  const renderPanel = useRender3DPanelSystem(panelRef)
  const { entity, camera, renderer } = renderPanel.state

  useEffect(() => {
    loadAvatarPreview()
  }, [avatarUrl])

  const loadAvatarPreview = () => {
    if (!avatarUrl) return

    resetAnimationLogic(entity.value)
    ObjectLayerMaskComponent.setLayer(entity.value, ObjectLayers.Panel)
    setComponent(entity.value, ModelComponent, { src: avatarUrl, convertToVRM: true })
    setComponent(entity.value, LoopAnimationComponent, {
      animationPack: defaultAnimationPath + preloadedAnimations.locomotion + '.glb',
      activeClipIndex: 5
    })

    camera.value.position.y = 1
    camera.value.position.z = 1
  }

  return (
    <Box className={`${commonStyles.preview} ${fill ? styles.fill : ''}`} sx={sx}>
      <div ref={panelRef} id="stage" className={`${styles.stage} ${fill ? styles.fill : ''}`} />

      {avatarLoading && (
        <LoadingView
          title={t('admin:components.avatar.loading')}
          variant="body2"
          sx={{ position: 'absolute', top: 0 }}
        />
      )}

      {!avatarUrl && (
        <Text className={commonStyles.previewText} variant="body2">
          {t('admin:components.avatar.avatarPreview')}
        </Text>
      )}

      <Tooltip
        arrow
        title={
          <Box sx={{ width: 100 }}>
            <Text variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {t('user:avatar.rotate')}:
            </Text>
            <Text variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
              {t('admin:components.avatar.leftClick')}
              <Icon type="Mouse" fontSize="small" />
            </Text>

            <br />

            <Text variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {t('user:avatar.pan')}:
            </Text>
            <Text variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
              {t('admin:components.avatar.rightClick')} <Icon type="Mouse" fontSize="small" />
            </Text>

            <br />

            <Text variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {t('admin:components.avatar.zoom')}:
            </Text>
            <Text variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
              {t('admin:components.avatar.scroll')} <Icon type="Mouse" fontSize="small" />
            </Text>
          </Box>
        }
      >
        <Icon type="Help" sx={{ position: 'absolute', top: 0, right: 0, margin: 1 }} />
      </Tooltip>
    </Box>
  )
}

export default AvatarPreview
