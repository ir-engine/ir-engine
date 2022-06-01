import React, { useEffect, useState } from 'react'

import { UserAvatar } from '@xrengine/common/src/interfaces/UserAvatar'
import { AvatarEffectComponent } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

import { ArrowBackIos, ArrowForwardIos, Check, PersonAdd } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import { AuthService, useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
}

const selectAvatarMenu = (props: Props) => {
  const MAX_AVATARS_PER_PAGE = window.innerWidth >= 1024 ? 9 : 12
  const MIN_AVATARS_PER_PAGE = 6
  const getAvatarPerPage = () => (window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE)
  const authState = useAuthState()
  const avatarId = authState.user?.avatarId?.value
  const avatarList = authState.avatarList.value

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
        selectedAvatar?.avatar?.name || '',
        selectedAvatar?.avatar?.url || '',
        selectedAvatar['user-thumbnail']?.url || ''
      )
    }
    setSelectedAvatar('')
  }

  const selectAvatar = (avatarResources: UserAvatar) => {
    setSelectedAvatar(avatarResources)
  }

  const openAvatarSelectMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(Views.AvatarUpload)
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
        <Grid key={avatar.id} item>
          <Paper
            onClick={() => selectAvatar(characterAvatar)}
            style={{ pointerEvents: avatar.name == avatarId ? 'none' : 'auto' }}
            className={`${styles.paperAvatar} ${
              avatar.name == selectedAvatar?.avatar?.name ? styles.selectedAvatar : ''
            }
              ${avatar.name == avatarId ? styles.activeAvatar : ''}`}
            sx={{
              height: 140,
              width: 170,
              boxShadow: 'none',
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1A2027' : '#f1f1f1')
            }}
          >
            <img className={styles.avatar} src={characterAvatar['user-thumbnail']?.url || ''} alt={avatar.name} />
          </Paper>
        </Grid>
      )
    }

    return avatarElementList
  }

  return (
    <div className={styles.avatarSelectContainer}>
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
              selectedAvatar
                ? selectedAvatar?.avatar?.name != avatarId
                  ? styles.btnDeepColorCancel
                  : ''
                : styles.disabledBtn
            }`}
            onClick={() => {
              setSelectedAvatar('')
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 'bold' }}>X</span>
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnCheck} ${
              selectedAvatar
                ? selectedAvatar?.avatar?.name != avatarId
                  ? styles.btnDeepColor
                  : ''
                : styles.disabledBtn
            }`}
            disabled={selectedAvatar?.avatar?.name == avatarId}
            onClick={confirmAvatar}
          >
            <Check />
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPerson}`} onClick={openAvatarSelectMenu}>
            <PersonAdd className={styles.size} />
          </button>
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnArrow} ${
            (page + 1) * imgPerPage >= avatarList.length ? styles.disabled : ''
          }`}
          onClick={loadNextAvatars}
        >
          <ArrowForwardIos className={styles.size} />
        </button>
      </div>
    </div>
  )
}

export default selectAvatarMenu
