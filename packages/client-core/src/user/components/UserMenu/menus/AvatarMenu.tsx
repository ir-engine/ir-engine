import React, { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { NavigateNext, NavigateBefore, Check, ArrowBack, PersonAdd, Delete, Close } from '@mui/icons-material'
import styles from '../UserMenu.module.scss'
import { useTranslation } from 'react-i18next'
import { LazyImage } from '../../../../common/components/LazyImage'
import { Views } from '../util'
import { isBot } from '@xrengine/engine/src/common/functions/isBot'

const AvatarMenu = (props: any): any => {
  const MAX_AVATARS_PER_PAGE = 6
  const MIN_AVATARS_PER_PAGE = 5

  const getAvatarPerPage = () => (window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE)
  const { t } = useTranslation()

  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(getAvatarPerPage())
  const [selectedAvatarId, setSelectedAvatarId] = useState('')
  const [isAvatarLoaded, setAvatarLoaded] = useState(false)
  const [avatarTobeDeleted, setAvatarTobeDeleted] = useState(null)
  let [menuRadius, setMenuRadius] = useState(window.innerWidth > 360 ? 182 : 150)

  let menuPadding = window.innerWidth > 360 ? 15 : 10
  let menuThickness = menuRadius > 170 ? 70 : 60
  let menuItemWidth = menuThickness - menuPadding
  let menuItemRadius = menuItemWidth / 2
  let effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2

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

  useEffect(() => {
    window.addEventListener('resize', calculateMenuRadius)
  }, [])

  const calculateMenuRadius = (): void => {
    setMenuRadius(window.innerWidth > 360 ? 182 : 150)
    calculateOtherValues()
  }

  const calculateOtherValues = (): void => {
    menuThickness = menuRadius > 170 ? 70 : 60
    menuItemWidth = menuThickness - menuPadding
    menuItemRadius = menuItemWidth / 2
    effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2
  }

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
    let angle = 0
    let index = 0
    let itemAngle = 0
    let x = 0
    let y = 0

    if (page === 0) {
      angle = 360 / (imgPerPage + 1)
      itemAngle = angle * index + 270
      x = effectiveRadius * Math.cos((itemAngle * Math.PI) / 280)
      y = effectiveRadius * Math.sin((itemAngle * Math.PI) / 280)
      index++

      avatarList.push(
        <div
          className={styles.menuItem}
          style={{
            width: menuItemWidth,
            height: menuItemWidth,
            transform: `translate(${x}px , ${y}px)`
          }}
        >
          <div type="button" className={styles.iconBlock} onClick={openAvatarSelectMenu}>
            <PersonAdd />
          </div>
        </div>
      )
    } else {
      angle = 360 / imgPerPage
    }

    for (let i = startIndex; i < endIndex; i++, index++) {
      const characterAvatar = props.avatarList[i]
      itemAngle = angle * index + 270
      x = effectiveRadius * Math.cos((itemAngle * Math.PI) / 280)
      y = effectiveRadius * Math.sin((itemAngle * Math.PI) / 280)

      avatarList.push(
        <Card
          key={characterAvatar.avatar.id}
          className={`
            ${styles.menuItem}
						${characterAvatar.avatar.name === selectedAvatarId ? styles.selectedAvatar : ''}
						${characterAvatar.avatar.name === props.avatarId ? styles.activeAvatar : ''}
					`}
          style={{
            width: menuItemWidth,
            height: menuItemWidth,
            transform: `translate(${x}px , ${y}px)`
          }}
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
    <section className={styles.avatarMenu}>
      <ClickAwayListener onClickAway={closeMenu} mouseEvent="onMouseDown">
        <div
          className={styles.itemContainer}
          style={{
            width: menuRadius * 2,
            height: menuRadius * 2,
            borderWidth: menuThickness
          }}
        >
          <div className={styles.itemContainerPrev}>
            <button
              type="button"
              className={`${styles.iconBlock} ${page === 0 ? styles.disabled : ''}`}
              onClick={loadPreviousAvatars}
            >
              <NavigateBefore />
            </button>
          </div>
          <div
            className={styles.menuItemBlock}
            style={{
              width: menuItemRadius,
              height: menuItemRadius
            }}
          >
            {renderAvatarList()}
          </div>
          <div className={styles.itemContainerNext}>
            <button
              type="button"
              className={`${styles.iconBlock} ${
                (page + 1) * imgPerPage >= props.avatarList.length ? styles.disabled : ''
              }`}
              onClick={loadNextAvatars}
            >
              <NavigateNext />
            </button>
          </div>
        </div>
      </ClickAwayListener>
    </section>
  )
}

export default AvatarMenu
