import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@xrengine/client-core/src/common/components/Avatar'
import AvatarPreview from '@xrengine/client-core/src/common/components/AvatarPreview'
import Button from '@xrengine/client-core/src/common/components/Button'
import commonStyles from '@xrengine/client-core/src/common/components/common.module.scss'
import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AvatarEffectComponent } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getState, useHookstate } from '@xrengine/hyperflux'

import { Check, Close, KeyboardArrowDown, KeyboardArrowUp, PersonAdd } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import { useAuthState } from '../../../services/AuthService'
import { AvatarService, AvatarState } from '../../../services/AvatarService'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
}

const AvatarSelectMenu = ({ changeActiveMenu }: Props) => {
  const { t } = useTranslation()
  const authState = useAuthState()
  const avatarId = authState.user?.avatarId?.value
  const avatarState = useHookstate(getState(AvatarState))
  const avatarList = avatarState.avatarList.value

  const [page, setPage] = useState(0)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarInterface | undefined>()

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (hasComponent(Engine.instance.currentWorld.localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) {
      AvatarService.updateUserAvatarId(authState.user.id.value!, avatarId, avatarURL, thumbnailURL)
    }
  }

  const loadNextAvatars = (e) => {
    e.preventDefault()

    setPage(page + 1)
    AvatarService.fetchAvatarList('increment')
  }

  const loadPreviousAvatars = (e) => {
    e.preventDefault()

    setPage(page - 1)
    AvatarService.fetchAvatarList('decrement')
  }

  const confirmAvatar = () => {
    if (selectedAvatar && avatarId != selectedAvatar?.name) {
      setAvatar(
        selectedAvatar?.id || '',
        selectedAvatar?.modelResource?.url || '',
        selectedAvatar?.thumbnailResource?.url || ''
      )
      changeActiveMenu(Views.Closed)
    }
    setSelectedAvatar(undefined)
  }

  const selectAvatar = (avatarResources: AvatarInterface) => {
    setSelectedAvatar(avatarResources)
  }

  const openAvatarSelectMenu = () => {
    changeActiveMenu(Views.AvatarUpload)
  }

  const openProfileMenu = () => {
    changeActiveMenu(Views.Profile)
  }

  return (
    <Menu
      open
      showBackButton
      title={t('user:avatar.titleSelectAvatar')}
      onBack={openProfileMenu}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box className={styles.menuContent}>
        <Grid sx={{ height: '100%', mb: 2 }} spacing={2} container className={commonStyles.flexWrapReverseSm}>
          <Grid item md={3} sx={{ width: '100%' }}>
            <Button
              fullWidth
              startIcon={<PersonAdd />}
              title={t('user:avatar.upload')}
              type="gradient"
              onClick={openAvatarSelectMenu}
            >
              {t('user:avatar.upload')}
            </Button>

            <Button
              className={commonStyles.hideSm}
              disabled={!selectedAvatar}
              fullWidth
              startIcon={<Close />}
              title={t('user:avatar.cancel')}
              type="gradient"
              onClick={() => {
                setSelectedAvatar(undefined)
              }}
            >
              {t('user:avatar.cancel')}
            </Button>

            <Button
              disabled={!selectedAvatar}
              fullWidth
              startIcon={<Check />}
              title={t('user:avatar.confirm')}
              type="gradient"
              onClick={confirmAvatar}
            >
              {t('user:avatar.confirm')}
            </Button>
          </Grid>

          <Grid item md={6} className={commonStyles.hideSm}>
            <AvatarPreview selectedAvatar={selectedAvatar} />
          </Grid>

          <Grid item md={3}>
            <IconButton icon={<KeyboardArrowUp />} sx={{ display: 'none' }} onClick={loadPreviousAvatars} />

            <Grid container spacing={1} sx={{ height: '275px', overflow: 'auto' }}>
              {avatarList.map((avatar) => (
                <Grid key={avatar.id} md={12} item>
                  <Avatar
                    imageSrc={avatar.thumbnailResource?.url || ''}
                    isSelected={avatar.name === selectedAvatar?.name}
                    name={avatar.name}
                    type="square"
                    onChange={() => selectAvatar(avatar)}
                  />
                </Grid>
              ))}
            </Grid>

            <IconButton icon={<KeyboardArrowDown />} sx={{ display: 'none' }} onClick={loadNextAvatars} />
          </Grid>
        </Grid>
      </Box>
    </Menu>
  )
}

export default AvatarSelectMenu
