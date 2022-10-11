import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { AvatarEffectComponent } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getState, useHookstate } from '@xrengine/hyperflux'

import { ArrowBack, ArrowBackIos, ArrowForwardIos, Check, PersonAdd } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import { useAuthState } from '../../../services/AuthService'
import { AvatarService, AvatarState } from '../../../services/AvatarService'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
}

const selectAvatarMenu = (props: Props) => {
  const { t } = useTranslation()

  const MAX_AVATARS_PER_PAGE = window.innerWidth >= 1024 ? 9 : 12
  const MIN_AVATARS_PER_PAGE = 6
  const getAvatarPerPage = () => (window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE)
  const authState = useAuthState()
  const avatarId = authState.user?.avatarId?.value
  const avatarState = useHookstate(getState(AvatarState))
  const avatarList = avatarState.avatarList.value

  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(getAvatarPerPage())
  const [selectedAvatar, setSelectedAvatar] = useState<any>('')

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  useEffect(() => {
    if (page * imgPerPage >= avatarState.avatarList.value.length) {
      if (page === 0) return
      setPage(page - 1)
    }
  }, [avatarState.avatarList.value])

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (hasComponent(Engine.instance.currentWorld.localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) {
      AvatarService.updateUserAvatarId(authState.user.id.value!, avatarId, avatarURL, thumbnailURL)
    }
  }

  const loadNextAvatars = (e) => {
    e.preventDefault()
    if ((page + 1) * imgPerPage >= avatarList.length) return
    setPage(page + 1)
  }
  const loadPreviousAvatars = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  const confirmAvatar = () => {
    if (selectedAvatar && avatarId != selectedAvatar?.avatar?.name) {
      setAvatar(
        selectedAvatar?.id || '',
        selectedAvatar?.modelResource?.url || '',
        selectedAvatar?.thumbnailResource?.url || ''
      )
      props.changeActiveMenu(null)
    }
    setSelectedAvatar('')
  }

  const selectAvatar = (avatarResources: AvatarInterface) => {
    setSelectedAvatar(avatarResources)
  }

  const openAvatarSelectMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(Views.AvatarUpload)
  }

  const openProfileMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(Views.Profile)
  }

  const renderAvatarList = () => {
    const avatarElementList = [] as JSX.Element[]
    const startIndex = page * imgPerPage
    const endIndex = Math.min(startIndex + imgPerPage, avatarList.length)
    let index = 0
    for (let i = startIndex; i < endIndex; i++, index++) {
      const avatar = avatarList[i]!

      avatarElementList.push(
        <Grid key={avatar.id} item>
          <Paper
            onClick={() => selectAvatar(avatar)}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            style={{ pointerEvents: avatar.name == avatarId ? 'none' : 'auto' }}
            className={`${styles.paperAvatar} ${avatar.name == selectedAvatar?.name ? styles.selectedAvatar : ''}
              ${avatar.name == avatarId ? styles.activeAvatar : ''}`}
            sx={{
              height: 140,
              width: 170,
              boxShadow: 'none',
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1A2027' : '#f1f1f1')
            }}
          >
            <img
              className={styles.avatar}
              src={avatar.thumbnailResource?.url || ''}
              alt={avatar.name}
              crossOrigin="anonymous"
            />
          </Paper>
        </Grid>
      )
    }

    return avatarElementList
  }

  return (
    <div className={styles.avatarSelectContainer}>
      <div className={styles.avatarHeaderBlock}>
        <button type="button" className={styles.iconBlock} onClick={openProfileMenu}>
          <ArrowBack />
        </button>
        <h2>{t('user:avatar.titleSelectAvatar')}</h2>
      </div>

      <div className={styles.avatarContainer}>
        <Grid container spacing={1} style={{ margin: 0 }}>
          {renderAvatarList()}
        </Grid>
      </div>

      <div className={styles.menuContainer}>
        <button type="button" className={`${styles.btnBack} ${styles.btnArrow} ${page === 0 ? styles.disabled : ''}`}>
          <ArrowBackIos className={styles.size} onClick={loadPreviousAvatars} />
        </button>
        <div className={styles.innerMenuContainer}>
          <button
            type="button"
            color="secondary"
            className={`${styles.btn} ${styles.btnCancel} ${
              selectedAvatar ? (selectedAvatar?.name != avatarId ? styles.btnDeepColorCancel : '') : styles.disabledBtn
            }`}
            onClick={() => {
              setSelectedAvatar('')
            }}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <span style={{ fontSize: '15px', fontWeight: 'bold' }}>X</span>
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnCheck} ${
              selectedAvatar ? (selectedAvatar?.name != avatarId ? styles.btnDeepColor : '') : styles.disabledBtn
            }`}
            disabled={selectedAvatar?.name == avatarId}
            onClick={confirmAvatar}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <Check />
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPerson}`}
            onClick={openAvatarSelectMenu}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <PersonAdd className={styles.size} />
          </button>
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnArrow} ${
            (page + 1) * imgPerPage >= avatarList.length ? styles.disabled : ''
          }`}
          onClick={loadNextAvatars}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          <ArrowForwardIos className={styles.size} />
        </button>
      </div>
    </div>
  )
}

export default selectAvatarMenu
