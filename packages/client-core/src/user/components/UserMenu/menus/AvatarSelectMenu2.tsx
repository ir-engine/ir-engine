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
import { hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { SpawnEffectComponent } from '@ir-engine/engine/src/avatar/components/SpawnEffectComponent'
import { LocalAvatarState } from '@ir-engine/engine/src/avatar/state/AvatarState'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { debounce } from 'lodash'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import { PopoverState } from '../../../../common/services/PopoverState'
import { UserMenus } from '../../../UserUISystem'
import { AuthService, AuthState } from '../../../services/AuthService'
import { PopupMenuServices } from '../PopupMenuService'
import styles from '../index.module.scss'
import { DiscardAvatarChangesModal } from './DiscardAvatarChangesModal'

const AVATAR_PAGE_LIMIT = 100

const AvatarMenu2 = () => {
  const { t } = useTranslation()
  const authState = useMutableState(AuthState)
  const userId = authState.user?.id?.value
  const userAvatarId = authState.user?.avatarId.value
  const avatarLoading = useHookstate(false)
  const isUserReady = useHookstate(getMutableState(LocalAvatarState).avatarReady)

  const [createAvatarEnabled] = useFeatureFlags([FeatureFlags.Client.Menu.CreateAvatar])

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
        else PopupMenuServices.showPopupMenu()
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
    if (avatarLoading.value && isUserReady.value) {
      avatarLoading.set(false)
      PopupMenuServices.showPopupMenu()
    }
  }, [isUserReady, avatarLoading])

  useEffect(() => {
    const userAvatar = avatarsData.find((item) => item.id === userAvatarId)
    if (!currentAvatar && !selectedAvatarId.value && userAvatar) {
      selectedAvatarId.set(userAvatar?.id)
    }
  }, [avatarsData, selectedAvatarId, currentAvatar, userAvatarId])

  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  return (
    <div className="fixed top-0 z-[35] flex h-[100vh] w-full bg-[rgba(0,0,0,0.75)]">
      <Modal
        id="select-avatar-modal"
        className="min-w-34 pointer-events-auto m-auto flex h-[95vh] w-[70vw] rounded-xl [&>div]:flex [&>div]:h-full [&>div]:max-h-full [&>div]:w-full  [&>div]:flex-1 [&>div]:flex-col"
        title={t('user:avatar.titleSelectAvatar')}
        onClose={() => PopupMenuServices.showPopupMenu()}
        showCloseButton={false}
        onSubmit={handleConfirmAvatar}
        hideFooter={true}
        hideHeaderCloseButton={true}
        rawChildren={
          <div className="flex h-full w-full flex-1 flex-col">
            <div className="grid h-full w-full flex-1 grid-cols-[60%,40%] gap-6 px-10 py-2">
              <div className={`${styles.avatarPreview} bg-gradient-to-b from-[#162941] to-[#114352]`}>
                <div className={`${styles.stars}`}></div>
                <AvatarPreview fill avatarUrl={currentAvatar?.modelResource?.url} />
              </div>
              <div className="grid h-full w-full grid-flow-row grid-rows-[3rem,1fr]">
                <div className="grid max-h-6 grid-cols-[65%,35%] gap-2">
                  <Input
                    data-test-id="search-avatar-input"
                    value={search.local.value}
                    placeholder={t('user:avatar.searchAvatar')}
                    className="text-sm font-normal"
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
                  <Button
                    rounded="partial"
                    className="text-sm font-normal"
                    size="small"
                    variant="secondary"
                    hidden={!createAvatarEnabled}
                    fullWidth={false}
                    onClick={() => PopupMenuServices.showPopupMenu(UserMenus.ReadyPlayer)}
                  >
                    {t('user:avatar.createAvatar')}
                  </Button>
                </div>
                <div className="max-h-[74vh] overflow-y-auto pb-6 pr-2">
                  <div className="grid grid-cols-1 gap-2">
                    {avatarsData.map((avatar) => (
                      <div key={avatar.id} className="w-full">
                        <Avatar
                          imageSrc={avatar.thumbnailResource?.url || ''}
                          isSelected={currentAvatar && avatar.id === currentAvatar.id}
                          name={avatar.name}
                          type="rectangle"
                          onClick={() => selectedAvatarId.set(avatar.id)}
                          onChange={() =>
                            PopupMenuServices.showPopupMenu(UserMenus.AvatarModify, { selectedAvatar: avatar })
                          }
                          className="max-h-[149px] max-w-[410px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center justify-center border-t border-t-theme-primary px-6 py-2">
              <Button
                data-testid="discard-changes-button"
                onClick={() => {
                  if (userAvatarId !== selectedAvatarId.value) {
                    PopoverState.showPopupover(
                      <DiscardAvatarChangesModal
                        handleConfirm={() => {
                          PopoverState.hidePopupover()
                          PopupMenuServices.showPopupMenu()
                        }}
                      />
                    )
                  } else {
                    PopupMenuServices.showPopupMenu()
                  }
                }}
                className="w-full max-w-[20%] place-self-center text-sm"
              >
                {t('user:common.discardChanges')}
              </Button>
              <Button
                data-testid="select-avatar-button"
                disabled={userAvatarId === selectedAvatarId.value}
                endIcon={avatarLoading.value ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
                onClick={handleConfirmAvatar}
                className="ml-2 w-full max-w-[20%] place-self-center text-sm"
              >
                {t('user:avatar.finishedEditing')}
              </Button>
            </div>
          </div>
        }
      ></Modal>
    </div>
  )
}

export default AvatarMenu2
