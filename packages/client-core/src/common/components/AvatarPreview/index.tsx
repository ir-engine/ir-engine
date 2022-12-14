import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import LoadingView from '@xrengine/client-core/src/common/components/LoadingView'
import Text from '@xrengine/client-core/src/common/components/Text'
import {
  loadAvatarForPreview,
  resetAnimationLogic
} from '@xrengine/client-core/src/user/components/Panel3D/helperFunctions'
import { useRender3DPanelSystem } from '@xrengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AvatarRigComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { getOptionalComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import HelpIcon from '@mui/icons-material/Help'
import MouseIcon from '@mui/icons-material/Mouse'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'

import styles from './index.module.scss'

interface Props {
  fill?: boolean
  selectedAvatar?: AvatarInterface
}

const AvatarPreview = ({ fill, selectedAvatar }: Props) => {
  const { t } = useTranslation()
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>

  const [avatarLoading, setAvatarLoading] = useState(false)

  const renderPanel = useRender3DPanelSystem(panelRef)
  const { entity, camera, scene } = renderPanel.state

  useEffect(() => {
    loadAvatarPreview()
  }, [selectedAvatar])

  const loadAvatarPreview = async () => {
    const oldAvatar = scene.value.children.find((item) => item.name === 'avatar')
    if (oldAvatar) {
      scene.value.remove(oldAvatar)
    }

    if (!selectedAvatar || !selectedAvatar.modelResource) return

    setAvatarLoading(true)
    resetAnimationLogic(entity.value)
    const avatar = await loadAvatarForPreview(entity.value, selectedAvatar.modelResource.url)
    const avatarRigComponent = getOptionalComponent(entity.value, AvatarRigComponent)
    if (avatarRigComponent) {
      avatarRigComponent.rig.Neck.getWorldPosition(camera.value.position)
      camera.value.position.y += 0.2
      camera.value.position.z = 0.6
    }
    setAvatarLoading(false)
    if (avatar) {
      avatar.name = 'avatar'
      scene.value.add(avatar)
    }
  }

  return (
    <Box className={`${styles.preview} ${fill ? styles.fill : ''}`}>
      <div ref={panelRef} id="stage" className={`${styles.stage} ${fill ? styles.fill : ''}`} />

      {avatarLoading && (
        <LoadingView
          title={t('admin:components.avatar.loading')}
          variant="body2"
          sx={{ position: 'absolute', top: 0 }}
        />
      )}

      {!selectedAvatar && (
        <Text
          sx={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            fontSize: 14,
            top: 0
          }}
        >
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
              <MouseIcon fontSize="small" />
            </Text>

            <br />

            <Text variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {t('user:avatar.pan')}:
            </Text>
            <Text variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
              {t('admin:components.avatar.rightClick')} <MouseIcon fontSize="small" />
            </Text>

            <br />

            <Text variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {t('admin:components.avatar.zoom')}:
            </Text>
            <Text variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
              {t('admin:components.avatar.scroll')} <MouseIcon fontSize="small" />
            </Text>
          </Box>
        }
      >
        <HelpIcon sx={{ position: 'absolute', top: 0, right: 0, margin: 1 }} />
      </Tooltip>
    </Box>
  )
}

export default AvatarPreview
