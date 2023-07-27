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

import { createState } from '@hookstate/core'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import config from '@etherealengine/common/src/config'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@etherealengine/common/src/constants/AvatarConstants'
import multiLogger from '@etherealengine/common/src/logger'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { getOptionalComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@etherealengine/engine/src/xrui/Widgets'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { loadAvatarForPreview, resetAnimationLogic, validate } from '../../../user/components/Panel3D/helperFunctions'
import { useRender3DPanelSystem } from '../../../user/components/Panel3D/useRender3DPanelSystem'
import { AvatarService } from '../../../user/services/AvatarService'
import { AVATAR_ID_REGEX, generateAvatarId } from '../../../util/avatarIdFunctions'
import styleString from './index.scss?inline'

const logger = multiLogger.child({ component: 'client-core:ReadyPlayerMenu' })

export function createReadyPlayerMenu() {
  return createXRUI(ReadyPlayerMenu, createReadyPlayerMenuState())
}

function createReadyPlayerMenuState() {
  return createState({})
}

const ReadyPlayerMenu = () => {
  const { t } = useTranslation()
  const [selectedBlob, setSelectedBlob] = useState<Blob>()
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [hover, setHover] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [error, setError] = useState('')
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const { entity, camera, scene, renderer } = renderPanel.state

  useEffect(() => {
    window.addEventListener('message', (event) => handleMessageEvent(event))
    return () => {
      window.removeEventListener('message', (event) => handleMessageEvent(event))
    }
  }, [avatarUrl])

  const handleMessageEvent = async (event) => {
    const url = event.data

    const avatarIdRegexExec = AVATAR_ID_REGEX.exec(url)

    if (url && url.toString().toLowerCase().startsWith('http')) {
      setShowLoading(true)
      setAvatarUrl(url)
      setAvatarName(avatarIdRegexExec ? avatarIdRegexExec[1] : generateAvatarId())
      try {
        const assetType = AssetLoader.getAssetType(url)
        if (assetType) {
          resetAnimationLogic(entity.value)
          loadAvatarForPreview(entity.value, url).then((obj) => {
            if (!obj) return
            obj.name = 'avatar'
            scene.value.add(obj)
            const avatarRigComponent = getOptionalComponent(entity.value, AvatarRigComponent)
            if (avatarRigComponent) {
              avatarRigComponent.rig.Neck.getWorldPosition(camera.value.position)
              camera.value.position.y += 0.2
              camera.value.position.z = 0.6
            }
            const error = validate(obj, renderer.value, scene.value, camera.value)
            setError(error)
          })
          fetch(url)
            .then((res) => res.blob())
            .then((data) => setSelectedBlob(data))
            .catch((err) => {
              setError(err.message)
              logger.error(err)
            })
            .finally(() => setShowLoading(false))
        }
      } catch (error) {
        logger.error(error)
        setError(t('user:usermenu.avatar.selectValidFile'))
      }
    } else {
      setShowLoading(false)
    }
  }

  const openProfileMenu = (e) => {
    WidgetAppService.setWidgetVisibility(WidgetName.PROFILE, true)
  }

  const closeMenu = (e) => {
    WidgetAppService.setWidgetVisibility(WidgetName.PROFILE, false)
    uploadAvatar()
  }

  const uploadAvatar = () => {
    if (error || selectedBlob === undefined) {
      return
    }

    const canvas = document.createElement('canvas')
    ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(renderer.value.domElement, 0, 0)

    const thumbnailName = avatarUrl.substring(0, avatarUrl.lastIndexOf('.')) + '.png'
    const modelName = avatarUrl.substring(0, avatarUrl.lastIndexOf('.')) + '.glb'

    canvas.toBlob(async (blob) => {
      await AvatarService.createAvatar(
        new File([selectedBlob!], modelName),
        new File([blob!], thumbnailName),
        avatarName,
        false
      )
      WidgetAppService.setWidgetVisibility(WidgetName.PROFILE, true)
    })
  }

  return (
    <>
      <style>{styleString}</style>
      <div
        className="ReadyPlayerPanel"
        style={{ width: selectedBlob ? '400px' : '600px', padding: selectedBlob ? '15px' : '0' }}
      >
        {selectedBlob && (
          <section className="controlContainer">
            <div className="actionBlock">
              <button
                type="button"
                className="iconBlock"
                style={{
                  borderRadius: '50%',
                  height: '40px',
                  width: '40px',
                  background: 'transparent'
                }}
                xr-layer="true"
                onClick={openProfileMenu}
              >
                <Icon type="ArrowBack" />
              </button>
            </div>
          </section>
        )}
        {!avatarUrl && <iframe style={{ width: '100%', height: '100%' }} src={config.client.readyPlayerMeUrl} />}
        <div
          ref={panelRef}
          id="stage"
          className="stage"
          style={{
            width: THUMBNAIL_WIDTH + 'px',
            height: THUMBNAIL_HEIGHT + 'px',
            margin: 'auto',
            display: 'block',
            boxShadow: !avatarUrl || showLoading ? 'none' : '0 0 10px var(--buttonOutlined)',
            borderRadius: '8px'
          }}
        ></div>
        {selectedBlob && (
          <button
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            type="button"
            className="iconBlock"
            style={{
              color: hover ? '#fff' : '#5f5ff1',
              marginTop: '10px',
              left: '45%',
              border: 'none',
              borderRadius: '50%',
              height: '50px',
              width: '50px',
              background: hover ? '#5f5ff1' : '#fff'
            }}
            xr-layer="true"
            onClick={closeMenu}
          >
            <Icon type="Check" />
          </button>
        )}
        {showLoading && <CircularProgress style={{ position: 'absolute', top: '50%', left: '46%' }} />}
      </div>
    </>
  )
}

export default ReadyPlayerMenu
