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
  loadModelForPreview,
  resetAnimationLogic
} from '@etherealengine/client-core/src/user/components/Panel3D/helperFunctions'
import { useRender3DPanelSystem } from '@etherealengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import { SourceType } from '@etherealengine/engine/src/renderer/materials/components/MaterialSource'
import { removeMaterialSource } from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import InfiniteGridHelper from '@etherealengine/engine/src/scene/classes/InfiniteGridHelper'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { useHookstate } from '@etherealengine/hyperflux'

import styles from '../styles.module.scss'

export const ModelPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const loading = useHookstate(true)

  const error = useHookstate('')
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const { camera, entity, scene, renderer } = renderPanel.state
  const gridHelper = new InfiniteGridHelper()
  gridHelper.layers.set(ObjectLayers.Panel)
  gridHelper.children.forEach((child) => {
    child.layers.set(ObjectLayers.Panel)
  })

  useEffect(() => {
    scene.value.add(gridHelper)
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
      scene.value.remove(gridHelper)
    }
  }, [])

  useEffect(() => {
    const loadModel = async () => {
      try {
        resetAnimationLogic(entity.value)
        const model = await loadModelForPreview(entity.value, url)
        if (model) {
          model.name = 'avatar'
          const result = scene.value.getObjectByName(model.name)
          if (result) scene.value.remove(result)
          scene.value.add(model)
        }
        loading.set(false)
      } catch (err) {
        loading.set(false)
        error.set(err.message)
      }
    }

    loadModel()

    return () => {
      const sceneVal = scene.value
      const avatar = sceneVal.children.find((child) => child.name === 'avatar')
      if (avatar?.userData['src']) {
        removeMaterialSource({ type: SourceType.MODEL, path: avatar.userData['src'] })
      }
    }
  }, [url])

  return (
    <>
      {loading.value && <LoadingView />}
      {error.value && (
        <div className={styles.container}>
          <h1 className={styles.error}>{error.value}</h1>
        </div>
      )}
      <div id="stage" ref={panelRef} style={{ minHeight: '250px', width: '100%', height: '100%' }}></div>
    </>
  )
}
