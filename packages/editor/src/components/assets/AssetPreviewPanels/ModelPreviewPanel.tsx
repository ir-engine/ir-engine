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

import debounce from 'lodash.debounce'
import React, { useEffect, useRef } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import {
  PreviewPanelRendererState,
  useRender3DPanelSystem
} from '@etherealengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { ObjectLayerMaskComponent } from '@etherealengine/engine/src/scene/components/ObjectLayerComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { MathUtils } from 'three'
import styles from '../styles.module.scss'

export const ModelPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const loading = useHookstate(true)

  const error = useHookstate('')
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const renderPanelState = getMutableState(PreviewPanelRendererState)

  useEffect(() => {
    //scene.value.add(gridHelper)
    const handleSizeChange = () => {
      renderPanel.resize()
    }

    const handleSizeChangeDebounced = debounce(handleSizeChange, 100)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === panelRef.current) {
          handleSizeChangeDebounced()
        }
      }
    })

    if (panelRef.current) {
      resizeObserver.observe(panelRef.current)
    }

    return () => {
      resizeObserver.disconnect()
      handleSizeChangeDebounced.cancel()
      //scene.value.remove(gridHelper)
    }
  }, [])

  useEffect(() => {
    const renderPanelEntities = renderPanelState.entities[panelRef.current.id]
    const entity = createEntity()
    setComponent(entity, NameComponent, '3D Preview Entity')
    const uuid = MathUtils.generateUUID() as EntityUUID
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, ModelComponent, { src: url })
    setComponent(entity, EnvmapComponent, { type: 'Skybox' })
    setComponent(entity, VisibleComponent, false)

    ObjectLayerMaskComponent.setLayer(entity, ObjectLayers.AssetPreview)

    if (renderPanelEntities[1].value) removeEntity(renderPanelEntities[1].value)
    renderPanelEntities[1].set(entity)
    loading.set(false)
  }, [url])

  return (
    <>
      {loading.value && <LoadingView />}
      {error.value && (
        <div className={styles.container}>
          <h1 className={styles.error}>{error.value}</h1>
        </div>
      )}
      <div id="modelPreview" ref={panelRef} style={{ minHeight: '250px', width: '100%', height: '100%' }}></div>
    </>
  )
}
