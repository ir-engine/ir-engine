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

import { SxProps, Theme } from '@mui/material/styles'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import commonStyles from '@ir-engine/client-core/src/common/components/common.module.scss'
import Text from '@ir-engine/client-core/src/common/components/Text'
import { useRender3DPanelSystem } from '@ir-engine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import {
  createEntity,
  generateEntityUUID,
  getOptionalComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { EnvmapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { EnvMapSourceType } from '@ir-engine/engine/src/scene/constants/EnvMapEnum'
import { AmbientLightComponent, TransformComponent } from '@ir-engine/spatial'
import { AssetPreviewCameraComponent } from '@ir-engine/spatial/src/camera/components/AssetPreviewCameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent, getChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import Box from '@ir-engine/ui/src/primitives/mui/Box'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import Tooltip from '@ir-engine/ui/src/primitives/mui/Tooltip'

import { AnimationComponent } from '@ir-engine/engine/src/avatar/components/AnimationComponent'
import { AvatarRigComponent } from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { AnimationClip } from 'three'
import styles from './index.module.scss'

interface Props {
  fill?: boolean
  avatarUrl?: string
  sx?: SxProps<Theme>
  onAvatarError?: (error: string) => void
  onAvatarLoaded?: () => void
}

const AvatarPreview = ({ fill, avatarUrl, sx, onAvatarError, onAvatarLoaded }: Props) => {
  const { t } = useTranslation()
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const { sceneEntity, cameraEntity } = useRender3DPanelSystem(panelRef)
  const loaded = GLTFComponent.useSceneLoaded(sceneEntity)
  const errors = ErrorComponent.useComponentErrors(sceneEntity, GLTFComponent)

  useEffect(() => {
    if (!avatarUrl) return

    const uuid = generateEntityUUID()
    setComponent(sceneEntity, SceneComponent)
    setComponent(sceneEntity, UUIDComponent, uuid)
    setComponent(sceneEntity, NameComponent, '3D Preview Entity')
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(sceneEntity, VisibleComponent, true)
    setComponent(sceneEntity, EnvmapComponent, { type: EnvMapSourceType.Skybox })
    setComponent(sceneEntity, AvatarComponent)
    setComponent(sceneEntity, GLTFComponent, { src: avatarUrl })
    setComponent(sceneEntity, AvatarRigComponent)

    setComponent(cameraEntity, AssetPreviewCameraComponent, { targetModelEntity: sceneEntity })

    if (getChildrenWithComponents(sceneEntity, [AmbientLightComponent]).length) return
    const lightEntity = createEntity()
    setComponent(lightEntity, AmbientLightComponent)
    setComponent(lightEntity, TransformComponent)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, NameComponent, 'Ambient Light')
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: sceneEntity })

    return () => {
      removeEntity(lightEntity)
    }
  }, [avatarUrl])

  useEffect(() => {
    if (!loaded) return
    if (onAvatarLoaded) onAvatarLoaded()
  }, [loaded])

  useEffect(() => {
    if (!errors) return
    if (onAvatarError) onAvatarError(errors.value['LOADING_ERROR'])
  }, [errors])

  useEffect(() => {
    const animationComponent = getOptionalComponent(sceneEntity, AnimationComponent)
    if (!animationComponent) return
    const animation = AnimationClip.findByName(animationComponent.animations, 'Idle')

    if (!animation) return
    animationComponent.mixer.clipAction(animation).play()
  }, [useOptionalComponent(sceneEntity, AnimationComponent)?.animations])

  return (
    <Box className={`${commonStyles.preview} ${fill ? styles.fill : ''}`} sx={sx}>
      <div id="stage" className={`${styles.stage} ${fill ? styles.fill : ''}`}>
        <canvas ref={panelRef} style={{ pointerEvents: 'all' }} />
      </div>

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
