import { useHookstate } from '@hookstate/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { UserAvatar } from '@xrengine/common/src/interfaces/UserAvatar'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { AvatarEffectComponent } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { getState } from '@xrengine/hyperflux'

import { Check, Close, Delete, NavigateBefore, NavigateNext, PersonAdd } from '@mui/icons-material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import { LazyImage } from '../../../../common/components/LazyImage'
import { useAuthState } from '../../../services/AuthService'
import { AvatarService, AvatarState } from '../../../services/AvatarService'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
}

const AvatarMenu = (props: Props) => {
  const MAX_AVATARS_PER_PAGE = 6
  const MIN_AVATARS_PER_PAGE = 5

  const getAvatarPerPage = () => (window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE)
  const { t } = useTranslation()

  const authState = useAuthState()
  const avatarId = authState.user?.avatarId?.value
  const avatarState = useHookstate(getState(AvatarState))
  const avatarList = avatarState.avatarList.value

  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(getAvatarPerPage())
  const [selectedAvatarId, setSelectedAvatarId] = useState('')
  const [isAvatarLoaded, setAvatarLoaded] = useState(false)
  const [avatarTobeDeleted, setAvatarTobeDeleted] = useState<AvatarInterface | null>()

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
    AvatarService.fetchAvatarList()
  }, [isAvatarLoaded])

  useEffect(() => {
    if (page * imgPerPage >= avatarState.avatarList.value.length) {
      if (page === 0) return
      setPage(page - 1)
    }
  }, [avatarState.avatarList])

  useEffect(() => {
    window.addEventListener('resize', calculateMenuRadius)
  }, [])

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (hasComponent(Engine.instance.currentWorld.localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) {
      AvatarService.updateUserAvatarId(authState.user.id.value!, avatarId, avatarURL, thumbnailURL)
    }
  }

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
    if ((page + 1) * imgPerPage >= avatarList.length) return
    setPage(page + 1)
  }
  const loadPreviousAvatars = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  const selectAvatar = (avatar: AvatarInterface) => {
    setSelectedAvatarId(avatar?.id || '')
    if (avatarId !== avatar?.id) {
      setAvatar(avatar?.id || '', avatar?.modelResource?.url || '', avatar?.thumbnailResource?.url || '')
    }
  }

  const closeMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(null)
  }

  const openAvatarSelectMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(Views.AvatarUpload)
  }

  const setRemovingAvatar = (e, avatarResource) => {
    e.stopPropagation()
    setAvatarTobeDeleted(avatarResource)
  }

  const removeAvatar = async (e, confirmation) => {
    e.stopPropagation()
    if (confirmation && avatarTobeDeleted?.id) {
      await Promise.all([
        AvatarService.removeStaticResource(avatarTobeDeleted.modelResourceId),
        AvatarService.removeStaticResource(avatarTobeDeleted.thumbnailResourceId)
      ])
      await AvatarService.removeAvatar(avatarTobeDeleted.id)
    }

    setAvatarTobeDeleted(null)
  }

  const renderAvatarList = () => {
    const avatarElementList = [] as JSX.Element[]
    const startIndex = page * imgPerPage
    const endIndex = Math.min(startIndex + imgPerPage, avatarList.length)
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

      avatarElementList.push(
        <div
          key={`avatarMenuItem${index}`}
          className={styles.menuItem}
          style={{
            width: menuItemWidth,
            height: menuItemWidth,
            transform: `translate(${x}px , ${y}px)`
          }}
        >
          <button
            type="button"
            className={styles.iconBlock}
            onClick={openAvatarSelectMenu}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <PersonAdd />
          </button>
        </div>
      )
    } else {
      angle = 360 / imgPerPage
    }

    for (let i = startIndex; i < endIndex; i++, index++) {
      const characterAvatar = avatarList[i]!
      itemAngle = angle * index + 270
      x = effectiveRadius * Math.cos((itemAngle * Math.PI) / 280)
      y = effectiveRadius * Math.sin((itemAngle * Math.PI) / 280)

      avatarElementList.push(
        <Card
          key={characterAvatar.id}
          className={`
            ${styles.menuItem}
						${characterAvatar.name === selectedAvatarId ? styles.selectedAvatar : ''}
						${characterAvatar.name === avatarId ? styles.activeAvatar : ''}
					`}
          style={{
            width: menuItemWidth,
            height: menuItemWidth,
            transform: `translate(${x}px , ${y}px)`
          }}
        >
          <CardContent
            onClick={() => selectAvatar(characterAvatar)}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <LazyImage
              key={characterAvatar.id}
              src={characterAvatar?.thumbnailResource?.url || ''}
              alt={characterAvatar.name}
            />
            {characterAvatar.id ? (
              avatarTobeDeleted && avatarTobeDeleted?.id === characterAvatar.id ? (
                <div className={styles.confirmationBlock}>
                  <p>{t('user:usermenu.avatar.confirmation')}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      removeAvatar(e, true)
                    }}
                    onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    className={styles.yesBtn}
                  >
                    <Check />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      removeAvatar(e, false)
                    }}
                    onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
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
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  disabled={characterAvatar.id === avatarId}
                  title={
                    characterAvatar.id === avatarId
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

    return avatarElementList
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
              className={`${styles.iconBlock} ${(page + 1) * imgPerPage >= avatarList.length ? styles.disabled : ''}`}
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
