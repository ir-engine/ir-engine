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

import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@etherealengine/client-core/src/common/components/Avatar'
import AvatarPreview from '@etherealengine/client-core/src/common/components/AvatarPreview'
import Button from '@etherealengine/client-core/src/common/components/Button'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { AvatarEffectComponent } from '@etherealengine/engine/src/avatar/components/AvatarEffectComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { AvatarState } from '@etherealengine/engine/src/avatar/state/AvatarNetworkState'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { AvatarID, avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { debounce } from 'lodash'
import { LoadingCircle } from '../../../../components/LoadingCircle'
import { UserMenus } from '../../../UserUISystem'
import { AuthState } from '../../../services/AuthService'
import { PopupMenuServices } from '../PopupMenuService'
import styles from '../index.module.scss'

const AVATAR_PAGE_LIMIT = 100

const AvatarMenu = () => {
  const { t } = useTranslation()
  const authState = useHookstate(getMutableState(AuthState))
  const userId = authState.user?.id?.value
  const userAvatarId = useHookstate(getMutableState(AvatarState)[Engine.instance.userID].avatarID as AvatarID)
  const avatarLoading = useHookstate(false)
  const isUserReady = useHookstate(getMutableState(EngineState).userReady)

  const page = useHookstate(0)
  const selectedAvatarId = useHookstate('' as AvatarID)
  const search = useHookstate({ local: '', query: '' })

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

  const handleConfirmAvatar = () => {
    if (userAvatarId.value !== selectedAvatarId.value) {
      if (!hasComponent(Engine.instance.localClientEntity, AvatarEffectComponent) && authState.user?.value) {
        AvatarState.updateUserAvatarId(selectedAvatarId.value)
      }
    }
    selectedAvatarId.set('' as AvatarID)
    avatarLoading.set(true)
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

  return (
    <Menu
      open
      showBackButton
      actions={
        <Box display="flex" width="100%" justifyContent="center">
          {avatarLoading.value ? (
            <LoadingCircle />
          ) : (
            <Button
              disabled={!currentAvatar || currentAvatar.id === userAvatarId.value}
              startIcon={<Icon type="Check" />}
              size="medium"
              type="gradientRounded"
              title={t('user:avatar.confirm')}
              onClick={handleConfirmAvatar}
            >
              {t('user:avatar.confirm')}
            </Button>
          )}
        </Box>
      }
      title={t('user:avatar.titleSelectAvatar')}
      onBack={() => PopupMenuServices.showPopupMenu(UserMenus.Profile)}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box className={styles.menuContent}>
        <Grid container spacing={2}>
          <Grid item md={6} sx={{ width: '100%', mt: 1 }}>
            <AvatarPreview fill avatarUrl={currentAvatar?.modelResource?.url} />
          </Grid>

          <Grid item md={6} sx={{ width: '100%' }}>
            <InputText
              placeholder={t('user:avatar.searchAvatar')}
              value={search.local.value}
              sx={{ mt: 1 }}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <IconButton
              icon={<Icon type="KeyboardArrowUp" />}
              sx={{ display: 'none' }}
              onClick={() => page.set((prevPage) => prevPage - 1)}
            />

            <Grid container sx={{ height: '275px', gap: 1.5, overflowX: 'hidden', overflowY: 'auto' }}>
              {avatarsData.map((avatar) => (
                <Grid item key={avatar.id} md={12} sx={{ pt: 0, width: '100%' }}>
                  <Avatar
                    imageSrc={avatar.thumbnailResource?.url || ''}
                    isSelected={currentAvatar && avatar.id === currentAvatar.id}
                    name={avatar.name}
                    showChangeButton={userId && avatar.userId === userId}
                    type="rectangle"
                    onClick={() => selectedAvatarId.set(avatar.id)}
                    onChange={() => PopupMenuServices.showPopupMenu(UserMenus.AvatarModify, { currentAvatar: avatar })}
                  />
                </Grid>
              ))}

              {avatarsData.length === 0 && (
                <Text align="center" margin={'32px auto'} variant="body2">
                  {t('user:avatar.noAvatars')}
                </Text>
              )}
            </Grid>

            <Box>
              <IconButton
                icon={<Icon type="KeyboardArrowDown" />}
                sx={{ display: 'none' }}
                onClick={() => page.set((prevPage) => prevPage + 1)}
              />
            </Box>
            <Button
              fullWidth
              startIcon={<Icon type="PersonAdd" />}
              title={t('user:avatar.createAvatar')}
              type="gradientRounded"
              sx={{ mb: 0 }}
              onClick={() => PopupMenuServices.showPopupMenu(UserMenus.AvatarModify)}
            >
              {t('user:avatar.createAvatar')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Menu>
  )
}

export default AvatarMenu
