import React, { useEffect, useState } from 'react'
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
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { useAuthState } from '../../../services/AuthService'
import { AvatarService, useAvatarService } from '../../../services/AvatarService'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
}

const AvatarMenu = ({ changeActiveMenu }: Props) => {
  const { t } = useTranslation()
  const authState = useAuthState()
  const userId = authState.user?.id?.value
  const userAvatarId = authState.user?.avatarId?.value

  const avatarState = useAvatarService()
  const { avatarList, search } = avatarState.value

  const [page, setPage] = useState(0)
  const [localSearchString, setLocalSearchString] = useState(search)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | undefined>(userAvatarId)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const selectedAvatar = avatarList.find((item) => item.id === selectedAvatarId)

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (hasComponent(Engine.instance.localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) {
      AvatarService.updateUserAvatarId(authState.user.id.value!, avatarId, avatarURL, thumbnailURL)
    }
  }

  const handleConfirmAvatar = () => {
    if (selectedAvatarId && selectedAvatar && userAvatarId !== selectedAvatarId) {
      setAvatar(
        selectedAvatarId,
        selectedAvatar.modelResource?.LOD0_url || selectedAvatar.modelResource?.url || '',
        selectedAvatar.thumbnailResource?.LOD0_url || selectedAvatar.thumbnailResource?.url || ''
      )
      changeActiveMenu(Views.Closed)
    }
    setSelectedAvatarId(undefined)
  }

  const handleNextAvatars = (e) => {
    e.preventDefault()

    setPage(page + 1)
    AvatarService.fetchAvatarList(search, 'increment')
  }

  const handlePreviousAvatars = (e) => {
    e.preventDefault()

    setPage(page - 1)
    AvatarService.fetchAvatarList(search, 'decrement')
  }

  const handleSearch = async (searchString: string) => {
    setLocalSearchString(searchString)

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      AvatarService.fetchAvatarList(searchString)
    }, 1000)

    setSearchTimeout(timeout)
  }

  return (
    <Menu
      open
      showBackButton
      actions={
        <Box display="flex" width="100%">
          <Button
            disabled={!selectedAvatar || selectedAvatar.id === userAvatarId}
            startIcon={<Icon type="Check" />}
            size="medium"
            type="gradientRounded"
            title={t('user:avatar.confirm')}
            onClick={handleConfirmAvatar}
          >
            {t('user:avatar.confirm')}
          </Button>
        </Box>
      }
      title={t('user:avatar.titleSelectAvatar')}
      onBack={() => changeActiveMenu(Views.Profile)}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box className={styles.menuContent}>
        <Grid container spacing={2}>
          <Grid item md={6} sx={{ width: '100%', mt: 1 }}>
            <AvatarPreview fill avatarUrl={selectedAvatar?.modelResource?.LOD0_url} />
          </Grid>

          <Grid item md={6} sx={{ width: '100%' }}>
            <InputText
              placeholder={t('user:avatar.searchAvatar')}
              value={localSearchString}
              sx={{ mt: 1 }}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <IconButton
              icon={<Icon type="KeyboardArrowUp" />}
              sx={{ display: 'none' }}
              onClick={handlePreviousAvatars}
            />

            <Grid container sx={{ height: '275px', gap: 1.5, overflowX: 'hidden', overflowY: 'auto' }}>
              {avatarList.map((avatar) => (
                <Grid item key={avatar.id} md={12} sx={{ pt: 0, width: '100%' }}>
                  <Avatar
                    imageSrc={avatar.thumbnailResource?.LOD0_url || ''}
                    isSelected={selectedAvatar && avatar.id === selectedAvatar.id}
                    name={avatar.name}
                    showChangeButton={userId && avatar.userId === userId}
                    type="rectangle"
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    onChange={() => changeActiveMenu(Views.AvatarModify, { selectedAvatar: avatar })}
                  />
                </Grid>
              ))}

              {avatarList.length === 0 && (
                <Text align="center" margin={'32px auto'} variant="body2">
                  {t('user:avatar.noAvatars')}
                </Text>
              )}
            </Grid>

            <Box>
              <IconButton
                icon={<Icon type="KeyboardArrowDown" />}
                sx={{ display: 'none' }}
                onClick={handleNextAvatars}
              />
            </Box>
            <Button
              fullWidth
              startIcon={<Icon type="PersonAdd" />}
              title={t('user:avatar.createAvatar')}
              type="gradientRounded"
              sx={{ mb: 0 }}
              onClick={() => changeActiveMenu(Views.AvatarModify)}
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
