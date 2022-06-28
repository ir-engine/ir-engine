import { createState } from '@speigg/hookstate'
import React, { useEffect, useState } from 'react'

import { UserAvatar } from '@xrengine/common/src/interfaces/UserAvatar'
import { AvatarEffectComponent } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { accessWidgetAppState, WidgetAppActions } from '@xrengine/engine/src/xrui/WidgetAppService'
import { dispatchAction } from '@xrengine/hyperflux'

import { ArrowBackIos, ArrowForwardIos, Check, PersonAdd } from '@mui/icons-material'

import { AuthService, useAuthState } from '../../../user/services/AuthService'
import styleString from './index.scss'

export function createSelectAvatarMenu() {
  return createXRUI(SelectAvatarMenu, createSelectAvatarMenuState())
}

function createSelectAvatarMenuState() {
  return createState({})
}

const SelectAvatarMenu = () => {
  const MAX_AVATARS_PER_PAGE = window.innerWidth >= 1024 ? 9 : 12
  const MIN_AVATARS_PER_PAGE = 6
  const getAvatarPerPage = () => (window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE)
  const authState = useAuthState()
  const avatarId = authState.user?.avatarId?.value
  const avatarList = authState.avatarList.value

  const userSettings = authState.user.user_setting.value
  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(getAvatarPerPage())
  const [selectedAvatar, setSelectedAvatar] = useState<any>('')

  useEffect(() => {
    AuthService.fetchAvatarList()
  }, [])

  useEffect(() => {
    if (page * imgPerPage >= authState.avatarList.value.length) {
      if (page === 0) return
      setPage(page - 1)
    }
  }, [authState.avatarList.value])

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (hasComponent(useWorld().localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) {
      AuthService.updateUserAvatarId(authState.user.id.value!, avatarId, avatarURL, thumbnailURL)
    }
  }

  const loadNextAvatars = () => {
    if ((page + 1) * imgPerPage >= avatarList.length) return
    setPage(page + 1)
  }

  const loadPreviousAvatars = () => {
    if (page === 0) return
    setPage(page - 1)
  }

  const confirmAvatar = () => {
    if (selectedAvatar && avatarId != selectedAvatar?.avatar?.name) {
      setAvatar(
        selectedAvatar?.avatar?.name || '',
        selectedAvatar?.avatar?.url || '',
        selectedAvatar['user-thumbnail']?.url || ''
      )
      setWidgetVisibility('Profile', false)
    }
    setSelectedAvatar('')
  }

  const selectAvatar = (avatarResources: UserAvatar) => {
    setSelectedAvatar(avatarResources)
  }

  const openAvatarSelectMenu = (e) => {
    setWidgetVisibility('UploadAvatar', true)
  }

  const setWidgetVisibility = (widgetName: string, visibility: boolean) => {
    const widgetState = accessWidgetAppState()
    const widgets = Object.entries(widgetState.widgets.value).map(([id, widgetState]) => ({
      id,
      ...widgetState,
      ...Engine.instance.currentWorld.widgets.get(id)!
    }))

    const currentWidget = widgets.find((w) => w.label === widgetName)

    // close currently open widgets until we support multiple widgets being open at once
    for (let widget of widgets) {
      if (currentWidget && widget.id !== currentWidget.id) {
        dispatchAction(WidgetAppActions.showWidget({ id: widget.id, shown: false }))
      }
    }

    currentWidget && dispatchAction(WidgetAppActions.showWidget({ id: currentWidget.id, shown: visibility }))
  }

  const renderAvatarList = () => {
    const avatarElementList = [] as JSX.Element[]
    const startIndex = page * imgPerPage
    const endIndex = Math.min(startIndex + imgPerPage, avatarList.length)
    let index = 0
    for (let i = startIndex; i < endIndex; i++, index++) {
      const characterAvatar = avatarList[i]!
      const avatar = characterAvatar.avatar!

      avatarElementList.push(
        <div
          key={avatar.id}
          xr-layer="true"
          onClick={() => selectAvatar(characterAvatar)}
          className={`paperAvatar ${avatar.name == selectedAvatar?.avatar?.name ? 'selectedAvatar' : ''}
              ${avatar.name == avatarId ? 'activeAvatar' : ''}`}
          style={{
            pointerEvents: avatar.name == avatarId ? 'none' : 'auto',
            height: '140px',
            width: '170px',
            boxShadow: 'none',
            backgroundColor: userSettings?.themeMode === 'dark' ? '#1A2027' : '#f1f1f1'
          }}
        >
          <img className="avatar" src={characterAvatar['user-thumbnail']?.url || ''} alt={avatar.name} />
        </div>
      )
    }

    return avatarElementList
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="avatarSelectContainer">
        <div className="avatarContainer">
          <div className="gridContainer" style={{ margin: 0 }}>
            {renderAvatarList()}
          </div>
        </div>
        <div className="menuContainer">
          <button
            type="button"
            className={`btn btnArrow ${page === 0 ? 'disabled' : ''}`}
            xr-layer="true"
            onClick={loadPreviousAvatars}
          >
            <ArrowBackIos className="size" />
          </button>
          <div className="innerMenuContainer">
            <button
              type="button"
              color="secondary"
              className={`btn btnCancel ${
                selectedAvatar ? (selectedAvatar?.avatar?.name != avatarId ? 'btnDeepColorCancel' : '') : 'disabledBtn'
              }`}
              xr-layer="true"
              onClick={() => {
                setSelectedAvatar('')
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 'bold' }}>X</span>
            </button>
            <button
              type="button"
              className={`btn btnCheck ${
                selectedAvatar ? (selectedAvatar?.avatar?.name != avatarId ? 'btnDeepColor' : '') : 'disabledBtn'
              }`}
              disabled={selectedAvatar?.avatar?.name == avatarId}
              onClick={confirmAvatar}
              xr-layer="true"
            >
              <Check />
            </button>
            <button type="button" className={`btn btnPerson`} onClick={openAvatarSelectMenu} xr-layer="true">
              <PersonAdd className="size" />
            </button>
          </div>
          <button
            type="button"
            className={`btn btnArrow ${(page + 1) * imgPerPage >= avatarList.length ? 'disabled' : ''}`}
            xr-layer="true"
            onClick={loadNextAvatars}
          >
            <ArrowForwardIos className="size" />
          </button>
        </div>
      </div>
    </>
  )
}

export default SelectAvatarMenu
