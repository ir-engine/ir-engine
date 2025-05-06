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

import Avatar from '@ir-engine/client-core/src/common/components/Avatar/Avatar2'
import AvatarPreview from '@ir-engine/client-core/src/common/components/AvatarPreview'
import { useFind, useMutation } from '@ir-engine/common'
import { AvatarID, avatarPath, userAvatarPath } from '@ir-engine/common/src/schema.type.module'
import { hasComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { SpawnEffectComponent } from '@ir-engine/engine/src/avatar/components/SpawnEffectComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { debounce } from 'lodash'
import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { Button, Input } from '@ir-engine/ui'
import { ArrowLeftLg, UserPlus01Sm, XCloseLg } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { twMerge } from 'tailwind-merge'
import { ModalState } from '../../../common/services/ModalState'
import { AuthService, AuthState } from '../../services/AuthService'
import AvatarCreatorMenu2, { SupportedSdks } from './AvatarCreatorMenu'
import AvatarModifyMenu from './AvatarModifyMenu'

const AVATAR_PAGE_LIMIT = 100
interface AvatarMenuProps {
  showBackButton: boolean
  previewEnabled?: boolean
}

const AvatarSelectMenu = forwardRef(({ showBackButton, previewEnabled = true }: AvatarMenuProps, ref) => {
  const { t } = useTranslation()
  const authState = useMutableState(AuthState)
  const userId = authState.user?.id?.value
  const avatar = useFind(userAvatarPath, { query: { userId } }).data[0]
  const userAvatarId = avatar?.avatarId
  const avatarLoading = useHookstate(false)
  const selfAvatarEntity = AvatarComponent.useSelfAvatarEntity()
  const selfAvatarLoaded = useOptionalComponent(selfAvatarEntity, GLTFComponent)?.progress?.value === 100

  const avatarCreatorMenuRef = useRef<{
    handleClose: () => Promise<void>
  } | null>(null)

  const [createAvatarEnabled, uploadAvatarEnabled] = useFeatureFlags([
    FeatureFlags.Client.Menu.CreateAvatar,
    FeatureFlags.Client.Menu.UploadAvatar
  ])

  const page = useHookstate(0)
  const selectedAvatarId = useHookstate('' as AvatarID)
  const search = useHookstate({ local: '', query: '' })
  const userAvatarMutation = useMutation(userAvatarPath)

  const avatarsData = useFind(avatarPath, {
    query: {
      name: {
        $like: `%${search.query.value}%`
      },
      $skip: page.value * AVATAR_PAGE_LIMIT,
      $limit: AVATAR_PAGE_LIMIT
    }
  }).data
  const currentAvatar = avatarsData.find((item) => item.id === selectedAvatarId.value)
  const searchTimeoutCancelRef = useRef<(() => void) | null>(null)

  AuthService.useAPIListeners()

  const handleConfirmAvatar = async () => {
    if (userAvatarId !== selectedAvatarId.value) {
      const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
      if (!selfAvatarEntity || !hasComponent(selfAvatarEntity, SpawnEffectComponent)) {
        await userAvatarMutation.patch(null, { avatarId: selectedAvatarId.value }, { query: { userId } })
        if (selfAvatarEntity) avatarLoading.set(true)
        else ModalState.closeModal()
      }
    }
    selectedAvatarId.set('' as AvatarID)
  }

  const handleSearch = async (searchString: string) => {
    search.local.set(searchString)

    if (searchTimeoutCancelRef.current) {
      searchTimeoutCancelRef.current()
    }

    const debouncedSearchQuery = debounce(() => {
      search.query.set(searchString)
    }, 500)

    debouncedSearchQuery()

    searchTimeoutCancelRef.current = debouncedSearchQuery.cancel
  }

  useEffect(() => {
    if (avatarLoading.value && selfAvatarLoaded) {
      avatarLoading.set(false)
      ModalState.closeModal()
    }
  }, [selfAvatarLoaded, avatarLoading])

  useEffect(() => {
    const userAvatar = avatarsData.find((item) => item.id === userAvatarId)
    if (userAvatar && selectedAvatarId.value !== userAvatar.id) {
      selectedAvatarId.set(userAvatar?.id)
    }
  }, [avatarsData, userAvatarId])

  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  const handleClose = async () => {
    if (userAvatarId !== selectedAvatarId.value) {
      await handleConfirmAvatar()
    }
    ModalState.closeModal()
  }

  // expose handleClose since only the parent component
  // can set the onClickOutside handler
  useImperativeHandle(ref, () => {
    return {
      handleClose
    }
  })

  const handleAvatarCreatorMenuClose = () => {
    if (avatarCreatorMenuRef.current) {
      avatarCreatorMenuRef.current?.handleClose()
    } else {
      ModalState.closeModal()
    }
  }

  return (
    <div
      id="select-avatar-modal"
      className={twMerge(
        'pointer-events-auto absolute z-50 m-auto flex bg-white dark:bg-surface-1',
        'h-[90dvh] max-w-[90vw] border border-surface-1',
        'overflow-y-auto rounded-xl lg:h-[95dvh] lg:w-[70vw] lg:max-w-6xl ',
        previewEnabled ? 'lg:w-auto lg:max-w-6xl' : 'w-full lg:w-[24rem] lg:max-w-96'
      )}
    >
      <div className="grid h-full w-full grid-rows-[3.5rem,1fr]">
        <div className="grid h-14 w-full grid-cols-[1.5rem,1fr,1.5rem] border-b px-5">
          {showBackButton && (
            <button
              data-testid="back-select-avatar-modal-button"
              className=" h-6 w-6 cursor-pointer self-center bg-transparent text-text-primary hover:bg-transparent focus:bg-transparent"
              onClick={handleClose}
            >
              <ArrowLeftLg />
            </button>
          )}
          <Text className="col-start-2 place-self-center self-center text-text-primary">
            {t('user:avatar.titleSelectAvatar')}
          </Text>
          <button
            data-testid="close-select-avatar-modal-button"
            className="h-6 w-6 cursor-pointer self-center bg-transparent  text-text-primary hover:bg-transparent focus:bg-transparent"
            onClick={handleClose}
          >
            <XCloseLg />
          </button>
        </div>
        <div
          className={twMerge(
            'h-full max-h-[calc(95vh-3.5rem)] w-full flex-1 gap-6 px-5 py-2',
            previewEnabled ? 'grid grid-cols-[1fr,24rem]' : 'flex max-w-96 flex-col self-center'
          )}
        >
          {previewEnabled && (
            <div className="relative h-full min-h-0 min-w-0 rounded-lg bg-gradient-to-b from-[#162941] to-[#114352]">
              <div className="stars absolute left-0 top-0 h-[2px] w-[2px] animate-twinkling bg-transparent"></div>
              <AvatarPreview fill avatarUrl={currentAvatar?.modelResource?.url} />
            </div>
          )}
          <div className="grid h-full min-h-0 w-full min-w-0 grid-flow-row grid-rows-[3rem,1fr]">
            <div className="flex max-h-6 max-w-96 gap-2">
              <Input
                fullWidth
                data-test-id="search-avatar-input"
                value={search.local.value}
                placeholder={t('user:avatar.searchAvatar')}
                onChange={(event) => {
                  search.local.set(event.target.value)

                  if (debouncedSearchQueryRef) {
                    clearTimeout(debouncedSearchQueryRef.current)
                  }

                  debouncedSearchQueryRef.current = setTimeout(() => {
                    handleSearch(event.target.value)
                  }, 100)
                }}
              />
              {createAvatarEnabled && (
                <Button
                  className="whitespace-nowrap rounded-md text-sm font-normal"
                  size="l"
                  variant="primary"
                  onClick={() => {
                    const Menu = AvatarCreatorMenu2(SupportedSdks.ReadyPlayerMe)
                    ModalState.openModal(
                      <Menu
                        ref={avatarCreatorMenuRef}
                        showBackButton={showBackButton}
                        previewEnabled={previewEnabled}
                      />,
                      handleAvatarCreatorMenuClose
                    )
                  }}
                >
                  <UserPlus01Sm />
                  {t('user:avatar.createAvatar')}
                </Button>
              )}
              {uploadAvatarEnabled && (
                <Button
                  className="min-w-[8rem] rounded-md text-sm font-normal"
                  variant="secondary"
                  onClick={() => {
                    ModalState.openModal(<AvatarModifyMenu />)
                  }}
                >
                  {t('user:avatar.uploadAvatar')}
                </Button>
              )}
            </div>
            <div className="flex max-h-[calc(95vh-7.5rem)] flex-col pb-6">
              <div className="flex max-w-96 flex-1 flex-col gap-2 overflow-y-auto">
                {avatarsData.map((avatar) => (
                  <Fragment key={avatar.id}>
                    <Avatar
                      imageSrc={avatar.thumbnailResource?.url || ''}
                      isSelected={currentAvatar && avatar.id === currentAvatar.id}
                      name={avatar.name}
                      type="rectangle"
                      onClick={() => selectedAvatarId.set(avatar.id)}
                      onChange={() => ModalState.openModal(<AvatarModifyMenu selectedAvatar={avatar} />)}
                    />
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default AvatarSelectMenu
