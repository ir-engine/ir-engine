import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { NavigateNext, NavigateBefore, Check, ArrowBack, PersonAdd, Delete, Close } from '@material-ui/icons'
import styles from '../UserMenu.module.scss'
import { useTranslation } from 'react-i18next'
import { LazyImage } from '../../../../common/components/LazyImage'
import { Views } from '../util'
import { isBot } from '@xrengine/engine/src/common/functions/isBot'

const AvatarMenu = (props: any): any => {
  const MAX_AVATARS_PER_PAGE = 6
  const MIN_AVATARS_PER_PAGE = 4

  const getAvatarPerPage = () => (window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE)
  const { t } = useTranslation()

  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(getAvatarPerPage())
  const [selectedAvatarId, setSelectedAvatarId] = useState('')
  const [isAvatarLoaded, setAvatarLoaded] = useState(false)
  const [avatarTobeDeleted, setAvatarTobeDeleted] = useState(null)

  useEffect((() => {
    function handleResize() {
      setImgPerPage(getAvatarPerPage())
    }

    window.addEventListener('resize', handleResize)

    return (_) => {
      window.removeEventListener('resize', handleResize)
    }
  }) as any)

  useEffect(() => {
    props.fetchAvatarList()
  }, [isAvatarLoaded])

  useEffect(() => {
    if (page * imgPerPage >= props.avatarList.length) {
      if (page === 0) return
      setPage(page - 1)
    }
  }, [props.avatarList])

  const loadNextAvatars = (e) => {
    e.preventDefault()
    if ((page + 1) * imgPerPage >= props.avatarList.length) return
    setPage(page + 1)
  }
  const loadPreviousAvatars = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  const selectAvatar = (avatarResources: any) => {
    const avatar = avatarResources.avatar
    setSelectedAvatarId(avatar.name)
    if (!isBot(window) && props.avatarId !== avatar.name) {
      props.setAvatar(avatar.name, avatar.url, avatarResources['user-thumbnail'].url)
    }
  }

  const closeMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(null)
  }

  const openProfileMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(Views.Profile)
  }

  const openAvatarSelectMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(Views.AvatarUpload)
  }

  const setRemovingAvatar = (e, avatarResource) => {
    e.stopPropagation()
    setAvatarTobeDeleted(avatarResource)
  }

  const removeAvatar = (e, confirmation) => {
    e.stopPropagation()
    if (confirmation) {
      props.removeAvatar([avatarTobeDeleted.avatar.key, avatarTobeDeleted['user-thumbnail'].key])
    }

    setAvatarTobeDeleted(null)
  }

  const renderAvatarList = () => {
    const avatarList = []
    const startIndex = page * imgPerPage
    const endIndex = Math.min(startIndex + imgPerPage, props.avatarList.length)
    for (let i = startIndex; i < endIndex; i++) {
      const characterAvatar = props.avatarList[i]

      avatarList.push(
        <Card
          key={characterAvatar.avatar.id}
          className={`
						${styles.avatarPreviewWrapper}
						${characterAvatar.avatar.name === props.avatarId ? styles.activeAvatar : ''}
						${characterAvatar.avatar.name === selectedAvatarId ? styles.selectedAvatar : ''}
					`}
        >
          <CardContent onClick={() => selectAvatar(characterAvatar)}>
            <LazyImage
              key={characterAvatar.avatar.id}
              src={characterAvatar['user-thumbnail'].url}
              alt={characterAvatar.avatar.name}
            />
            {characterAvatar.avatar.userId ? (
              avatarTobeDeleted && avatarTobeDeleted.avatar.url === characterAvatar.avatar.url ? (
                <div className={styles.confirmationBlock}>
                  <p>{t('user:usermenu.avatar.confirmation')}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      removeAvatar(e, true)
                    }}
                    className={styles.yesBtn}
                  >
                    <Check />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      removeAvatar(e, false)
                    }}
                    className={styles.noBtn}
                  >
                    <Close />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.deleteBlock}
                  onClick={(e) => setRemovingAvatar(e, characterAvatar)}
                  disabled={characterAvatar.avatar.name === props.avatarId}
                  title={
                    characterAvatar.avatar.name === props.avatarId
                      ? t('user:usermenu.avatar.canNotBeRemoved')
                      : t('user:usermenu.avatar.remove')
                  }
                >
                  <Delete />
                </button>
              )
            ) : null}
          </CardContent>
        </Card>
      )
    }

    return avatarList
  }
  return (
    <div className={styles.avatarPanel}>
      <section className={styles.avatarContainer}>{renderAvatarList()}</section>
      <section className={styles.controlContainer}>
        <button
          type="button"
          className={`${styles.iconBlock} ${page === 0 ? styles.disabled : ''}`}
          onClick={loadPreviousAvatars}
        >
          <NavigateBefore />
        </button>
        <div className={styles.actionBlock}>
          <button type="button" className={styles.iconBlock} onClick={openProfileMenu}>
            <ArrowBack />
          </button>
          <button type="button" id="confirm-avatar" className={styles.iconBlock} onClick={closeMenu}>
            <Check />
          </button>
          {props.enableSharing !== false && (
            <button type="button" className={styles.iconBlock} onClick={openAvatarSelectMenu}>
              <PersonAdd />
            </button>
          )}
        </div>
        <button
          type="button"
          className={`${styles.iconBlock} ${(page + 1) * imgPerPage >= props.avatarList.length ? styles.disabled : ''}`}
          onClick={loadNextAvatars}
        >
          <NavigateNext />
        </button>
      </section>
    </div>
  )
}

export default AvatarMenu
