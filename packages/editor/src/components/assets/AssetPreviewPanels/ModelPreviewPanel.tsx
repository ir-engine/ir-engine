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

import { t } from 'i18next'
import React, { useEffect, useRef } from 'react'

import { useRender3DPanelSystem } from '@etherealengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import { createEntity, generateEntityUUID, setComponent, UUIDComponent } from '@etherealengine/ecs'
import { AssetPreviewCameraComponent } from '@etherealengine/engine/src/camera/components/AssetPreviewCameraComponent'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { useHookstate } from '@etherealengine/hyperflux'
import { AmbientLightComponent, TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'

import styles from '../styles.module.scss'

export const ModelPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const loading = useHookstate(true)

  const error = useHookstate('')
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)

  useEffect(() => {
    const { sceneEntity, cameraEntity } = renderPanel
    setComponent(sceneEntity, NameComponent, '3D Preview Entity')
    const uuid = generateEntityUUID()
    setComponent(sceneEntity, UUIDComponent, uuid)
    setComponent(sceneEntity, ModelComponent, { src: url, cameraOcclusion: false })
    setComponent(sceneEntity, EnvmapComponent, { type: 'Skybox', envMapIntensity: 2 }) // todo remove when lighting works
    setComponent(cameraEntity, AssetPreviewCameraComponent, { targetModelEntity: sceneEntity })

    const lightEntity = createEntity()
    setComponent(lightEntity, AmbientLightComponent)
    setComponent(lightEntity, TransformComponent)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, NameComponent, 'Ambient Light')
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    loading.set(false)
  }, [url])

  return (
    <>
      {loading.value && <LoadingView className="h-6 w-6" title={t('common:loader.loading')} />}
      {error.value && (
        <div className={styles.container}>
          <h1 className={styles.error}>{error.value}</h1>
        </div>
      )}
      <div id="modelPreview" style={{ width: '100%', height: '100%' }}>
        <canvas ref={panelRef} style={{ width: '100%', height: '100%', pointerEvents: 'all' }} />
      </div>
    </>
  )
}
