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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getCanvasBlob } from '@ir-engine/client-core/src/common/utils'
import config from '@ir-engine/common/src/config'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@ir-engine/common/src/constants/AvatarConstants'

import multiLogger from '@ir-engine/common/src/logger'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Input } from '@ir-engine/ui'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { IoArrowBackOutline, IoCloseOutline } from 'react-icons/io5'
import AvatarPreview from '../../../../common/components/AvatarPreview'
import { PopoverState } from '../../../../common/services/PopoverState'
import { AVATAR_ID_REGEX, generateAvatarId } from '../../../../util/avatarIdFunctions'
import { UserMenus } from '../../../UserUISystem'
import { AvatarService } from '../../../services/AvatarService'
import { PopupMenuServices } from '../PopupMenuService'
import { SupportedSdks, isAvaturn } from './AvatarCreatorMenu'
import { DiscardAvatarChangesModal } from './DiscardAvatarChangesModal'

enum LoadingState {
  None,
  LoadingCreator,
  Downloading,
  LoadingPreview,
  Uploading
}

const AvatarCreatorMenu = (selectedSdk: string) => () => {
  const { t } = useTranslation()
  const selectedBlob = useHookstate<Blob | null>(null)
  const avatarName = useHookstate('')
  const avatarUrl = useHookstate('')
  const loading = useHookstate(LoadingState.LoadingCreator)
  const error = useHookstate('')

  const logger = multiLogger.child({ component: 'client-core:AvatarCreatorMenu' })

  const getSdkUrl = () => {
    switch (selectedSdk) {
      case SupportedSdks.Avaturn:
        return config.client.avaturnUrl
      case SupportedSdks.ReadyPlayerMe:
      default:
        return config.client.readyPlayerMeUrl
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessageEvent)
    return () => {
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [])

  useEffect(() => {
    const rpmIframe = document.getElementById('rpm-iframe') as HTMLIFrameElement
    rpmIframe.src = getSdkUrl() as string
  }, [])

  const parseMessage = (event: MessageEvent) => {
    try {
      return JSON.parse(event.data)
    } catch (error) {
      return event.data
    }
  }

  const handleReadyPlayerMeMessageEvent = async (event: MessageEvent) => {
    const message = typeof event.data === 'string' ? parseMessage(event) : event.data

    if (message.source !== 'readyplayerme') {
      return
    }

    if (message.eventName === 'v1.frame.ready') {
      const rpmIframe = document.getElementById('rpm-iframe') as HTMLIFrameElement
      rpmIframe?.contentWindow?.postMessage(
        JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.**'
        }),
        '*'
      )
    }

    if (message.eventName === 'v1.avatar.exported') {
      loading.set(LoadingState.Downloading)
      error.set('')
      avatarName.set(message.data.avatarId)
      try {
        const res = await fetch(message.data.url)
        const data = await res.blob()

        loading.set(LoadingState.LoadingPreview)
        avatarUrl.set(message.data.url)
        selectedBlob.set(data)
      } catch (error) {
        logger.error(error)
        error.set(t('user:usermenu.avatar.selectValidFile'))
        loading.set(LoadingState.None)
      }
    }
  }

  const handleAvaturnMessageEvent = async (event: MessageEvent) => {
    const message = typeof event.data === 'string' ? parseMessage(event) : event.data

    if (message.source !== 'avaturn') return // always check the source its always 'avaturn'

    // Get avatar GLB URL
    if (message.eventName === 'v2.avatar.exported') {
      const url = message.data.url
      const avatarIdRegexExec = AVATAR_ID_REGEX.exec(url)
      if (url && url.toString().toLowerCase().startsWith('http')) {
        loading.set(LoadingState.Downloading)
        error.set('')
        avatarName.set(avatarIdRegexExec ? avatarIdRegexExec[1] : generateAvatarId())

        try {
          const res = await fetch(url)
          const data = await res.blob()
          loading.set(LoadingState.LoadingPreview)
          avatarUrl.set(url)
          selectedBlob.set(data)
        } catch (error) {
          logger.error(error)
          error.set(t('user:usermenu.avatar.selectValidFile'))
          loading.set(LoadingState.None)
        }
      }
    }
  }

  const handleMessageEvent = async (event: MessageEvent): Promise<void> => {
    switch (selectedSdk) {
      case SupportedSdks.Avaturn:
        handleAvaturnMessageEvent(event)
        break
      case SupportedSdks.ReadyPlayerMe:
      default:
        await handleReadyPlayerMeMessageEvent(event)
    }
  }

  const uploadAvatar = async (): Promise<void> => {
    if (error.value || selectedBlob.value === null) {
      return
    }
    loading.set(LoadingState.Uploading)

    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    const avatarCanvas = document.getElementById('stage')?.firstChild as CanvasImageSource

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(avatarCanvas, 0, 0)

    const thumbnailName = avatarUrl.value.substring(0, avatarUrl.value.lastIndexOf('.')) + '.png'
    const modelName = !isAvaturn(avatarUrl.value)
      ? avatarUrl.value.substring(0, avatarUrl.value.lastIndexOf('.')) + '.glb'
      : avatarUrl.value.split('/').pop() + '.glb'

    const blob = await getCanvasBlob(canvas)
    await AvatarService.createAvatar(
      new File([selectedBlob.value!], modelName),
      new File([blob!], thumbnailName),
      avatarName.value,
      false
    )

    loading.set(LoadingState.None)
    PopupMenuServices.showPopupMenu(UserMenus.AvatarSelect2)
  }

  const loadingMessages = {
    [LoadingState.Downloading]: t('user:avatar.downloading'),
    [LoadingState.LoadingPreview]: t('user:avatar.loadingPreview'),
    [LoadingState.Uploading]: t('user:avatar.packagingAvatar'),
    default: t(`user:avatar.loading${selectedSdk}`)
  }

  const loadingTitle = loadingMessages[loading.value] || loadingMessages.default

  const avatarPreviewLoaded = loading.value === LoadingState.None && selectedBlob.value

  return (
    <div className="fixed top-0  z-[35] flex h-[100vh] w-full bg-[rgba(0,0,0,0.75)]">
      <Modal
        id="select-avatar-modal"
        className="min-w-34 pointer-events-auto m-auto flex h-[95vh] w-[70vw] max-w-6xl rounded-xl [&>div]:flex [&>div]:h-full [&>div]:max-h-full [&>div]:w-full  [&>div]:flex-1 [&>div]:flex-col"
        showCloseButton={false}
        hideFooter={true}
        rawChildren={
          <div className="flex h-full w-full flex-1 flex-col">
            <div className="grid h-14 w-full grid-cols-[2rem,1fr,2rem] border-b border-b-theme-primary px-8">
              <Button
                data-testid="edit-avatar-button"
                className=" h-6 w-6 self-center bg-transparent hover:bg-transparent focus:bg-transparent"
                onClick={() => PopupMenuServices.showPopupMenu(UserMenus.AvatarSelect2)}
              >
                <span>
                  <IoArrowBackOutline size={16} />
                </span>
              </Button>
              <Text className="col-start-2  place-self-center self-center">
                {loading.value !== LoadingState.Uploading
                  ? t('user:avatar.titleCustomizeAvatar')
                  : t('user:avatar.savingAvatar', { avatar: avatarName.value })}
              </Text>
              <Button
                fullWidth={false}
                data-testid="edit-avatar-button"
                className=" h-6 w-6 self-center bg-transparent hover:bg-transparent focus:bg-transparent"
                onClick={() =>
                  PopoverState.showPopupover(
                    <DiscardAvatarChangesModal
                      handleConfirm={() => {
                        PopoverState.hidePopupover()
                        PopupMenuServices.showPopupMenu()
                      }}
                    />
                  )
                }
              >
                <span>
                  <IoCloseOutline size={16} />
                </span>
              </Button>
            </div>
            <div className="grid h-full w-full flex-1 grid-cols-[1fr,50%,1fr] gap-6 px-10 py-2">
              {loading.value === LoadingState.LoadingCreator && (
                <iframe
                  id="rpm-iframe"
                  style={{
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    maxWidth: '100%',
                    border: 0
                  }}
                  className="col-span-3"
                />
              )}
              {loading.value !== LoadingState.LoadingCreator && avatarUrl && (
                <div className="relative col-start-2 rounded-lg bg-gradient-to-b from-[#162941] to-[#114352]">
                  <div className="stars absolute left-0 top-0 h-[2px] w-[2px] animate-twinkling bg-transparent"></div>
                  <AvatarPreview
                    avatarUrl={avatarUrl.value}
                    fill
                    onAvatarError={(e) => error.set(e)}
                    onAvatarLoaded={() => loading.set(LoadingState.None)}
                  />
                </div>
              )}
            </div>
            {avatarPreviewLoaded && (
              <div className="mx-auto mb-2 flex items-center gap-2 py-2">
                <Text className="" fontSize="sm">
                  {t('user:avatar.InputAvatarName')}
                </Text>
                <Input value={avatarName.value || ''} onChange={(e) => avatarName.set(e.target.value)} />
                <Button
                  size="sm"
                  disabled={loading.value !== LoadingState.None}
                  data-testid="upload-avatar-button"
                  onClick={uploadAvatar}
                  className="w-fit place-self-center text-sm"
                >
                  {t('user:avatar.saveAvatar')}
                </Button>
              </div>
            )}
            {loading.value !== LoadingState.None && loading.value !== LoadingState.LoadingCreator && (
              <div className="mx-auto flex justify-between py-2">
                <LoadingView
                  className="mr-2 h-6 max-h-6 w-6 justify-between"
                  containerClassName="flex-row"
                  title={loadingTitle}
                />
              </div>
            )}
          </div>
        }
      ></Modal>
    </div>
  )
}

export default AvatarCreatorMenu
