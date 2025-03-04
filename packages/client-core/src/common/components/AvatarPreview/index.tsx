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

import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import commonStyles from '@ir-engine/client-core/src/common/components/common.module.scss'
import {
  createEntity,
  EntityTreeComponent,
  getOptionalComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useOptionalComponent
} from '@ir-engine/ecs'
import { EnvMapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { EnvMapSourceType } from '@ir-engine/engine/src/scene/constants/EnvMapEnum'
import { HemisphereLightComponent, TransformComponent } from '@ir-engine/spatial'
import { AssetPreviewCameraComponent } from '@ir-engine/spatial/src/camera/components/AssetPreviewCameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { HelpIconLg, MouseLeftClickMd, MouseMd, MouseRightClickMd } from '@ir-engine/ui/src/icons'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'

import { useHookstate } from '@hookstate/core'
import config from '@ir-engine/common/src/config'
import { AnimationComponent } from '@ir-engine/engine/src/avatar/components/AnimationComponent'
import {
  AvatarAnimationComponent,
  AvatarRigComponent
} from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { AnimationClip } from 'three'
import { useRender3DPanelSystem } from '../../../hooks/useRender3DPanelSystem'
import styles from './index.module.scss'

interface Props {
  fill?: boolean
  avatarUrl?: string
  onAvatarError?: (error: string) => void
  onAvatarLoaded?: () => void
}

const AvatarPreview = ({ fill, avatarUrl, onAvatarError, onAvatarLoaded }: Props) => {
  const { t } = useTranslation()
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const { sceneEntity, cameraEntity } = useRender3DPanelSystem(panelRef)
  const loaded = GLTFComponent.useSceneLoaded(sceneEntity)
  const errors = ErrorComponent.useComponentErrors(sceneEntity, GLTFComponent)

  const avatar = useHookstate(UndefinedEntity)

  useEffect(() => {
    if (!avatarUrl) return

    avatar.set(createEntity())
    setComponent(avatar.value, TransformComponent)
    setComponent(avatar.value, VisibleComponent)
    setComponent(avatar.value, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(avatar.value, EnvMapComponent, {
      type: EnvMapSourceType.Equirectangular,
      envMapSourceURL:
        config.client.fileServer + '/projects/ir-engine/default-project/public/scenes/apartment-envmap.ktx2',
      envMapIntensity: 5
    })
    setComponent(avatar.value, AvatarComponent)
    setComponent(avatar.value, AvatarAnimationComponent)
    setComponent(avatar.value, AvatarRigComponent)

    const lightEntity = createEntity()
    setComponent(lightEntity, HemisphereLightComponent, { skyColor: 0xffffff, groundColor: 0x000000, intensity: 1 })
    setComponent(lightEntity, TransformComponent)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, NameComponent, 'Ambient Light')
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: sceneEntity })

    return () => {
      removeEntity(lightEntity)
      removeEntity(avatar.value)
    }
  }, [avatarUrl])

  useEffect(() => {
    if (!avatarUrl) return
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(avatar.value, GLTFComponent, { src: avatarUrl })
    //workaround to prevent a few frames of untextured, tposing avatars
    removeComponent(sceneEntity, VisibleComponent)
    setComponent(cameraEntity, AssetPreviewCameraComponent, { targetModelEntity: avatar.value })
  }, [avatar])

  useEffect(() => {
    if (!loaded) return
    if (onAvatarLoaded) onAvatarLoaded()
  }, [loaded])

  useEffect(() => {
    if (!errors) return
    if (onAvatarError) onAvatarError(errors.value['LOADING_ERROR'])
  }, [errors])

  useEffect(() => {
    const animationComponent = getOptionalComponent(avatar.value, AnimationComponent)
    if (!animationComponent) return
    const animation = AnimationClip.findByName(animationComponent.animations, 'Idle')

    if (!animation) return
    animationComponent.mixer.clipAction(animation).play()

    setComponent(sceneEntity, VisibleComponent, true)
  }, [useOptionalComponent(avatar.value, AnimationComponent)?.animations])

  return (
    <div className={`${commonStyles.preview} ${fill ? styles.fill : ''} relative`}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          margin: 10,
          zIndex: 1
        }}
      >
        <Tooltip
          position="bottom"
          content={
            <div style={{ width: 100 }}>
              <div style={{ fontWeight: 'bold' }}>{t('user:avatar.rotate')}:</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.leftClick')}
                <MouseLeftClickMd />
              </div>

              <br />

              <div style={{ fontWeight: 'bold' }}>{t('user:avatar.pan')}:</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.rightClick')} <MouseRightClickMd />
              </div>

              <br />

              <div style={{ fontWeight: 'bold' }}>{t('admin:components.avatar.zoom')}:</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.scroll')} <MouseMd />
              </div>
            </div>
          }
        >
          <HelpIconLg fontSize="larger" style={{ top: 0, right: 0, margin: 0 }} />
        </Tooltip>
      </div>
      <div id="stage" className={`${styles.stage} ${fill ? styles.fill : ''}`}>
        <canvas ref={panelRef} style={{ pointerEvents: 'all' }} />
      </div>

      {!avatarUrl && <div className={commonStyles.previewText}>{t('admin:components.avatar.avatarPreview')}</div>}
    </div>
  )
}

export default AvatarPreview
