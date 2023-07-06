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

import { createState, useHookstate } from '@hookstate/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AvatarInterface } from '@etherealengine/common/src/interfaces/AvatarInterface'
import { AvatarEffectComponent } from '@etherealengine/engine/src/avatar/components/AvatarEffectComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@etherealengine/engine/src/xrui/Widgets'
import { getMutableState } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { AuthState } from '../../../user/services/AuthService'
import { AvatarService, AvatarState } from '../../../user/services/AvatarService'
import XRIconButton from '../../components/XRIconButton'
import styleString from './index.scss?inline'

export function createSelectAvatarMenu() {
  return createXRUI(SelectAvatarMenu, createSelectAvatarMenuState())
}

function createSelectAvatarMenuState() {
  return createState({})
}

const SelectAvatarMenu = () => {
  const { t } = useTranslation()

  const MAX_AVATARS_PER_PAGE = window.innerWidth <= 1024 ? 9 : 12
  const MIN_AVATARS_PER_PAGE = 6
  const getAvatarPerPage = () => (window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE)
  const authState = useHookstate(getMutableState(AuthState))
  const avatarId = authState.user?.avatarId?.value
  const avatarState = useHookstate(getMutableState(AvatarState))

  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(Math.min(getAvatarPerPage(), avatarState.total.value))
  const [selectedAvatar, setSelectedAvatar] = useState<any>('')

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  useEffect(() => {
    if (page * imgPerPage >= avatarState.total.value) {
      if (page === 0) return
      setPage(page - 1)
    }
  }, [avatarState.total])

  const setAvatar = (avatarId: string) => {
    if (hasComponent(Engine.instance.localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) AvatarService.updateUserAvatarId(authState.user.id.value!, avatarId)
  }

  const loadNextAvatars = () => {
    if ((page + 1) * imgPerPage >= avatarState.total.value) return
    if ((page + 1) * imgPerPage >= avatarState.avatarList.value.length)
      AvatarService.fetchAvatarList(undefined, 'increment')
    setPage(page + 1)
  }

  const loadPreviousAvatars = () => {
    if (page === 0) return
    setPage(page - 1)
  }

  const confirmAvatar = () => {
    if (selectedAvatar && avatarId != selectedAvatar?.avatar?.name) {
      setAvatar(selectedAvatar?.id || '')
      WidgetAppService.setWidgetVisibility(WidgetName.PROFILE, false)
    }
    setSelectedAvatar('')
  }

  const selectAvatar = (avatarResources: AvatarInterface) => {
    setSelectedAvatar(avatarResources)
  }

  const openAvatarSelectMenu = (e) => {
    WidgetAppService.setWidgetVisibility(WidgetName.UPLOAD_AVATAR, true)
  }

  const openProfileMenu = (e) => {
    WidgetAppService.setWidgetVisibility(WidgetName.PROFILE, true)
  }

  const renderAvatarList = () => {
    const avatarElementList = [] as JSX.Element[]
    const startIndex = page * imgPerPage
    const endIndex = Math.min(startIndex + imgPerPage, avatarState.avatarList.value.length)
    let index = 0
    for (let i = startIndex; i < endIndex; i++, index++) {
      const avatar = avatarState.avatarList.get({ noproxy: true })[i]!

      avatarElementList.push(
        <div
          key={avatar.id}
          xr-layer="true"
          onClick={() => selectAvatar(avatar)}
          className={`paperAvatar ${avatar.name == selectedAvatar?.avatar?.name ? 'selectedAvatar' : ''}
              ${avatar.name == avatarId ? 'activeAvatar' : ''}`}
          style={{
            pointerEvents: avatar.name == avatarId ? 'none' : 'auto',
            height: '140px',
            width: '170px',
            boxShadow: 'none',
            backgroundColor: 'var(--mainBackground)'
          }}
        >
          <img className="avatar" crossOrigin="anonymous" src={avatar.thumbnailResource?.url || ''} alt={avatar.name} />
        </div>
      )
    }

    return avatarElementList
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="avatarSelectContainer">
        <div className="avatarHeaderBlock">
          <XRIconButton
            size="large"
            xr-layer="true"
            className="iconBlock"
            variant="iconOnly"
            onClick={openProfileMenu}
            content={<Icon type="ArrowBack" />}
          />
          <h2>{t('user:avatar.titleUploadAvatar')}</h2>
        </div>
        <div className="avatarContainer">
          <div className="gridContainer" style={{ margin: 0 }}>
            {renderAvatarList()}
          </div>
        </div>
        <div className="menuContainer">
          <XRIconButton
            xr-layer="true"
            onClick={loadPreviousAvatars}
            disabled={page === 0}
            content={<Icon type="ArrowBackIos" className="size" />}
          />
          <div className="innerMenuContainer">
            <XRIconButton
              xr-layer="true"
              backgroundColor="#f87678"
              onClick={() => {
                setSelectedAvatar('')
              }}
              disabled={!selectedAvatar}
              content={<span style={{ fontSize: '15px', fontWeight: 'bold' }}>X</span>}
            />
            <XRIconButton
              xr-layer="true"
              backgroundColor="#23af3a"
              onClick={confirmAvatar}
              disabled={selectedAvatar?.avatar?.name == avatarId}
              content={<Icon type="Check" />}
            />
            <XRIconButton
              xr-layer="true"
              backgroundColor="rgb(255 255 255 / 70%)"
              onClick={openAvatarSelectMenu}
              content={<Icon type="PersonAdd" className="size" />}
            />
          </div>
          <XRIconButton
            xr-layer="true"
            onClick={loadNextAvatars}
            disabled={(page + 1) * imgPerPage >= avatarState.total.value}
            content={<Icon type="ArrowForwardIos" className="size" />}
          />
        </div>
      </div>
    </>
  )
}

export default SelectAvatarMenu
