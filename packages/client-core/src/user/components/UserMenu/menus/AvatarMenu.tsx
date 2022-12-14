import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@xrengine/client-core/src/common/components/Avatar'
import AvatarPreview from '@xrengine/client-core/src/common/components/AvatarPreview'
import Button from '@xrengine/client-core/src/common/components/Button'
import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import Text from '@xrengine/client-core/src/common/components/Text'
import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AvatarEffectComponent } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { Check, KeyboardArrowDown, KeyboardArrowUp, PersonAdd } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import InputText from '../../../../common/components/InputText'
import { useAuthState } from '../../../services/AuthService'
import { AvatarService, useAvatarService } from '../../../services/AvatarService'
import styles from '../index.module.scss'
import { Views } from '../util'

enum AvatarMenuMode {
  Select,
  Create,
  Edit
}

interface Props {
  changeActiveMenu: Function
}

const AvatarMenu = ({ changeActiveMenu }: Props) => {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState(AvatarMenuMode.Select)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | undefined>()

  const authState = useAuthState()
  const avatarId = authState.user?.avatarId?.value
  const avatarState = useAvatarService()
  const { avatarList } = avatarState.value

  const selectedAvatar = avatarList.find((item) => item.id === selectedAvatarId)

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (hasComponent(Engine.instance.currentWorld.localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) {
      AvatarService.updateUserAvatarId(authState.user.id.value!, avatarId, avatarURL, thumbnailURL)
    }
  }

  const handleBack = () => {
    if (viewMode === AvatarMenuMode.Select) {
      changeActiveMenu(Views.Profile)
    } else {
      setViewMode(AvatarMenuMode.Select)
    }
  }

  const handleConfirmAvatar = () => {
    if (selectedAvatarId && selectedAvatar && avatarId !== selectedAvatarId) {
      setAvatar(selectedAvatarId, selectedAvatar.modelResource?.url || '', selectedAvatar.thumbnailResource?.url || '')
      changeActiveMenu(Views.Closed)
    }
    setSelectedAvatarId(undefined)
  }

  return (
    <Menu
      open
      showBackButton
      actions={
        <Box display="flex" width="100%">
          <Button
            disabled={!selectedAvatar}
            startIcon={<Check />}
            size="medium"
            type="gradientRounded"
            title={t('user:avatar.confirm')}
            onClick={handleConfirmAvatar}
          >
            {t('user:avatar.confirm')}
          </Button>
        </Box>
      }
      title={
        viewMode === AvatarMenuMode.Select
          ? t('user:avatar.titleSelectAvatar')
          : viewMode === AvatarMenuMode.Create
          ? t('user:avatar.createAvatar')
          : t('user:avatar.titleEditAvatar')
      }
      onBack={handleBack}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box className={styles.menuContent}>
        <Grid container spacing={2}>
          <Grid item md={6}>
            <AvatarPreview fill selectedAvatar={selectedAvatar} />
          </Grid>

          <Grid item md={6}>
            {viewMode === AvatarMenuMode.Select && (
              <AvatarSelectView
                selectedAvatar={selectedAvatar}
                setSelectedAvatarId={setSelectedAvatarId}
                setViewMode={setViewMode}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </Menu>
  )
}

interface AvatarSelectProps {
  selectedAvatar?: AvatarInterface
  setSelectedAvatarId: (avatarId: string | undefined) => void
  setViewMode: (mode: AvatarMenuMode) => void
}

const AvatarSelectView = ({ selectedAvatar, setSelectedAvatarId, setViewMode }: AvatarSelectProps) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const avatarState = useAvatarService()
  const { avatarList, search } = avatarState.value

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

  const handleEditAvatar = (avatar: AvatarInterface) => {
    setSelectedAvatarId(avatar.id)
    setViewMode(AvatarMenuMode.Edit)
  }

  const handleCreateAvatar = () => {
    setSelectedAvatarId(undefined)
    setViewMode(AvatarMenuMode.Create)
  }

  return (
    <>
      <InputText
        placeholder={t('user:avatar.searchAvatar')}
        value={search}
        onChange={(e) => AvatarService.fetchAvatarList(e.target.value)}
      />

      <IconButton icon={<KeyboardArrowUp />} sx={{ display: 'none' }} onClick={handlePreviousAvatars} />

      <Grid container sx={{ height: '275px', gap: 1.5, overflow: 'auto' }}>
        {avatarList.map((avatar) => (
          <Grid item key={avatar.id} md={12} sx={{ pt: 0 }}>
            <Avatar
              imageSrc={avatar.thumbnailResource?.url || ''}
              isSelected={selectedAvatar && avatar.id === selectedAvatar.id}
              name={avatar.name}
              showChangeButton
              type="rectangle"
              onClick={() => setSelectedAvatarId(avatar.id)}
              onChange={() => handleEditAvatar(avatar)}
            />
          </Grid>
        ))}

        {avatarList.length === 0 && (
          <Text align="center" margin={'32px auto'} variant="body2">
            {t('user:avatar.noAvatars')}
          </Text>
        )}
      </Grid>

      <IconButton icon={<KeyboardArrowDown />} sx={{ display: 'none' }} onClick={handleNextAvatars} />

      <Button
        fullWidth
        startIcon={<PersonAdd />}
        title={t('user:avatar.createAvatar')}
        type="gradientRounded"
        sx={{ mb: 0 }}
        onClick={handleCreateAvatar}
      >
        {t('user:avatar.createAvatar')}
      </Button>
    </>
  )
}

export default AvatarMenu
